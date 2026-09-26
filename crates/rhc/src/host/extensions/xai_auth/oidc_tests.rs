use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::TcpStream;
use std::sync::Arc;

use serde_json::json;

use super::{Pkce, authorize_url, code_from_request_line, query_param};
use crate::host::extensions::xai_auth::client::AuthClient;
use crate::host::extensions::xai_auth::scripted_http::ScriptedHttp;
use crate::host::extensions::xai_auth::session::OAuthSession;
use crate::host::extensions::xai_auth::store::TokenStore;
use crate::host::extensions::xai_auth::provider::XAI;
use crate::host::ports::auth::{Auth, AuthError};
use chrono::{Duration as ChronoDuration, Utc};

#[test]
fn authorize_url_is_browser_code_flow() {
    let pkce = Pkce {
        code_verifier: "verifier".into(),
        code_challenge: "challenge".into(),
    };
    let url = authorize_url("http://127.0.0.1:9/callback", &pkce, "state-1", "nonce-1");
    assert!(url.starts_with(XAI.authorize_url));
    assert!(url.contains("response_type=code"));
    assert!(url.contains("code_challenge_method=S256"));
    assert!(url.contains("code_challenge=challenge"));
    assert!(query_param(url.split_once('?').unwrap().1, "scope").as_deref() == Some(XAI.scopes));
    assert!(query_param(url.split_once('?').unwrap().1, "client_id").as_deref() == Some(XAI.client_id));
    assert!(!url.contains("device"));
}

#[test]
fn callback_rejects_mismatched_state() {
    let err = code_from_request_line("GET /callback?code=abc&state=other HTTP/1.1", "expected")
        .unwrap_err();
    assert!(err.to_string().contains("state"));
}

#[test]
fn loopback_then_token_success() {
    let http = Arc::new(ScriptedHttp::new(HashMap::from([(
        "/oauth2/token".into(),
        vec![(
            200,
            json!({
                "access_token": "at-1",
                "refresh_token": "rt-1",
                "expires_in": 3600,
                "id_token": dummy_jwt("sub-1", "a@x.ai"),
            }),
        )],
    )])));
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("auth.json");
    let client = AuthClient::new(dir.path(), dir.path().join("grok.json")).with_http(http.clone());
    let mut stderr = Vec::new();
    let snapshot = client
        .login_with_browser(&mut stderr, &|url| {
            let query = url.split_once('?').unwrap().1;
            let redirect = query_param(query, "redirect_uri").unwrap();
            let state = query_param(query, "state").unwrap();
            let mut stream = TcpStream::connect(redirect.trim_start_matches("http://").trim_end_matches("/callback"))
                .unwrap();
            let request = format!(
                "GET /callback?code=code-1&state={state} HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n"
            );
            stream.write_all(request.as_bytes()).unwrap();
            let mut buf = [0u8; 1024];
            let _ = stream.read(&mut buf);
        })
        .unwrap();
    assert_eq!(snapshot.token, "at-1");
    assert_eq!(snapshot.identity.subject, "sub-1");
    let saved = TokenStore::new(&path)
        .load()
        .unwrap()
        .expect("saved session");
    assert_eq!(saved.refresh_token.as_deref(), Some("rt-1"));
    let reqs = http.requests.lock().unwrap();
    let token_form = &reqs[0].1;
    assert!(
        token_form
            .iter()
            .any(|(k, v)| k == "grant_type" && v == "authorization_code")
    );
    assert!(token_form.iter().any(|(k, v)| k == "code" && v == "code-1"));
    assert!(
        token_form
            .iter()
            .any(|(k, v)| k == "client_id" && v == XAI.client_id)
    );
}

#[test]
fn refresh_if_needed_noop_when_fresh() {
    let dir = tempfile::tempdir().unwrap();
    let store = TokenStore::new(dir.path().join("auth.json"));
    let session = OAuthSession {
        access_token: "at".into(),
        refresh_token: Some("rt".into()),
        expires_at: Utc::now() + ChronoDuration::hours(2),
        subject: "s".into(),
        email: None,
        issuer: XAI.issuer.into(),
        client_id: XAI.client_id.into(),
    };
    store.save(&session).unwrap();
    let client = AuthClient::new(dir.path(), dir.path().join("grok.json"));
    let out = client.refresh_if_needed().unwrap().expect("signed in");
    assert_eq!(out.token, "at");
}

#[test]
fn refresh_invalid_grant_clears_store() {
    let http = Arc::new(ScriptedHttp::new(HashMap::from([(
        "/oauth2/token".into(),
        vec![(400, json!({"error": "invalid_grant"}))],
    )])));
    let dir = tempfile::tempdir().unwrap();
    let store = TokenStore::new(dir.path().join("auth.json"));
    store
        .save(&OAuthSession {
            access_token: "old".into(),
            refresh_token: Some("rt".into()),
            expires_at: Utc::now() - ChronoDuration::hours(2),
            subject: "s".into(),
            email: None,
            issuer: XAI.issuer.into(),
            client_id: XAI.client_id.into(),
        })
        .unwrap();
    let client = AuthClient::new(dir.path(), dir.path().join("grok.json")).with_http(http);
    let err = client.refresh_if_needed().unwrap_err();
    assert!(matches!(err, AuthError::RefreshRevoked));
    assert!(client.snapshot().unwrap().is_none());
}

#[test]
fn refresh_rotates_access_token_and_keeps_refresh_token() {
    let http = Arc::new(ScriptedHttp::new(HashMap::from([(
        "/oauth2/token".into(),
        vec![(
            200,
            json!({
                "access_token": "at-2",
                "expires_in": 3600,
                "id_token": dummy_jwt("sub-2", "b@x.ai"),
            }),
        )],
    )])));
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("auth.json");
    let store = TokenStore::new(&path);
    store
        .save(&OAuthSession {
            access_token: "old".into(),
            refresh_token: Some("rt".into()),
            expires_at: Utc::now() - ChronoDuration::hours(2),
            subject: "s".into(),
            email: None,
            issuer: "https://issuer.example".into(),
            client_id: "client-kept".into(),
        })
        .unwrap();
    let client = AuthClient::new(dir.path(), dir.path().join("grok.json")).with_http(http.clone());
    let out = client.refresh_if_needed().unwrap().expect("signed in");
    assert_eq!(out.token, "at-2");
    let saved = store.load().unwrap().expect("saved session");
    assert_eq!(saved.access_token, "at-2");
    assert_eq!(saved.refresh_token.as_deref(), Some("rt"));
    assert_eq!(saved.subject, "sub-2");
    assert_eq!(saved.email.as_deref(), Some("b@x.ai"));
    assert_eq!(saved.issuer, "https://issuer.example");
    assert_eq!(saved.client_id, "client-kept");
    assert!(saved.expires_at > Utc::now() + ChronoDuration::minutes(59));
    let reqs = http.requests.lock().unwrap();
    assert_eq!(reqs[0].0, "https://auth.x.ai/oauth2/token");
    assert_eq!(
        reqs[0].1,
        vec![
            ("grant_type".to_string(), "refresh_token".to_string()),
            ("refresh_token".to_string(), "rt".to_string()),
            (
                "client_id".to_string(),
                "b1a00492-073a-47ea-816f-4c329264a828".to_string()
            ),
        ]
    );
}

fn dummy_jwt(sub: &str, email: &str) -> String {
    use base64::Engine;
    let payload = json!({"sub": sub, "email": email});
    let b64 = base64::engine::general_purpose::URL_SAFE_NO_PAD
        .encode(serde_json::to_vec(&payload).unwrap());
    format!("aaa.{b64}.sig")
}

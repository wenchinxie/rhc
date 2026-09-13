use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;

use serde_json::json;

use crate::client::AuthClient;
use crate::constants::{CLIENT_ID, DEVICE_GRANT_TYPE, ISSUER, REFERRER, SCOPES};
use crate::error::AuthError;
use crate::session::{OAuthSession, Session};
use crate::test_support::ScriptedHttp;
use chrono::{Duration as ChronoDuration, Utc};

fn no_sleep(_: Duration) {}

#[test]
fn device_code_then_token_success() {
    let http = Arc::new(ScriptedHttp::new(HashMap::from([
        (
            "/oauth2/device/code".into(),
            vec![(
                200,
                json!({
                    "device_code": "dc-1",
                    "user_code": "ABCD-EFGH",
                    "verification_uri": "https://auth.x.ai/device",
                    "expires_in": 600,
                    "interval": 0,
                }),
            )],
        ),
        (
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
        ),
    ])));
    let dir = tempfile::tempdir().unwrap();
    let client = AuthClient::new(dir.path().join("auth.json"))
        .with_http(http.clone())
        .with_sleep(Arc::new(no_sleep));
    let mut stderr = Vec::new();
    let session = client.login_with_stderr(&mut stderr).unwrap();
    assert_eq!(session.access_token, "at-1");
    assert_eq!(session.refresh_token.as_deref(), Some("rt-1"));
    assert_eq!(session.subject, "sub-1");
    let reqs = http.requests.lock().unwrap();
    let device_form = &reqs[0].1;
    assert!(device_form.iter().any(|(k, v)| k == "scope" && v == SCOPES));
    assert!(
        device_form
            .iter()
            .any(|(k, v)| k == "referrer" && v == REFERRER)
    );
    assert!(
        device_form
            .iter()
            .any(|(k, v)| k == "client_id" && v == CLIENT_ID)
    );
    let token_form = &reqs[1].1;
    assert!(
        token_form
            .iter()
            .any(|(k, v)| k == "grant_type" && v == DEVICE_GRANT_TYPE)
    );
}

#[test]
fn logged_out_proxy_headers_need_login() {
    let dir = tempfile::tempdir().unwrap();
    let client = AuthClient::new(dir.path().join("auth.json"));
    let err = client.load().unwrap().proxy_headers().unwrap_err();
    assert!(matches!(err, AuthError::NeedLogin));
}

#[test]
fn refresh_if_needed_noop_when_fresh() {
    let dir = tempfile::tempdir().unwrap();
    let store = crate::store::TokenStore::new(dir.path().join("auth.json"));
    let session = OAuthSession {
        access_token: "at".into(),
        refresh_token: Some("rt".into()),
        expires_at: Utc::now() + ChronoDuration::hours(2),
        subject: "s".into(),
        email: None,
        issuer: ISSUER.into(),
        client_id: CLIENT_ID.into(),
    };
    store.save(&session).unwrap();
    let client = AuthClient::new(dir.path().join("auth.json"));
    let Session::OAuth(out) = client.refresh_if_needed(client.load().unwrap()).unwrap() else {
        panic!("oauth");
    };
    assert_eq!(out.access_token, "at");
}

#[test]
fn refresh_invalid_grant_clears_store() {
    let http = Arc::new(ScriptedHttp::new(HashMap::from([(
        "/oauth2/token".into(),
        vec![(400, json!({"error": "invalid_grant"}))],
    )])));
    let dir = tempfile::tempdir().unwrap();
    let store = crate::store::TokenStore::new(dir.path().join("auth.json"));
    store
        .save(&OAuthSession {
            access_token: "old".into(),
            refresh_token: Some("rt".into()),
            expires_at: Utc::now() - ChronoDuration::hours(2),
            subject: "s".into(),
            email: None,
            issuer: ISSUER.into(),
            client_id: CLIENT_ID.into(),
        })
        .unwrap();
    let client = AuthClient::new(dir.path().join("auth.json")).with_http(http);
    let err = client
        .refresh_if_needed(client.load().unwrap())
        .unwrap_err();
    assert!(matches!(err, AuthError::RefreshRevoked));
    assert!(matches!(client.load().unwrap(), Session::LoggedOut));
}

fn dummy_jwt(sub: &str, email: &str) -> String {
    use base64::Engine;
    let payload = json!({"sub": sub, "email": email});
    let b64 = base64::engine::general_purpose::URL_SAFE_NO_PAD
        .encode(serde_json::to_vec(&payload).unwrap());
    format!("aaa.{b64}.sig")
}

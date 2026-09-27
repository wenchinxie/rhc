use std::collections::HashMap;
use std::path::Path;
use std::sync::Arc;

use chrono::{Duration as ChronoDuration, Utc};
use serde_json::json;

use crate::host::extensions::xai_auth::client::AuthClient;
use crate::host::extensions::xai_auth::provider::XAI;
use crate::host::extensions::xai_auth::scripted_http::ScriptedHttp;
use crate::host::extensions::xai_auth::session::OAuthSession;
use crate::host::extensions::xai_auth::store::TokenStore;
use crate::host::ports::models::ModelLister;

fn save_fresh_session(dir: &Path, token: &str) {
    let store = TokenStore::new(dir.join("auth.json"));
    store
        .save(&OAuthSession {
            access_token: token.into(),
            refresh_token: Some("rt".into()),
            expires_at: Utc::now() + ChronoDuration::hours(2),
            subject: "s".into(),
            email: None,
            issuer: XAI.issuer.into(),
            client_id: XAI.client_id.into(),
        })
        .unwrap();
}

#[test]
fn signed_out_lists_nothing() {
    let dir = tempfile::tempdir().unwrap();
    let http = Arc::new(ScriptedHttp::new(HashMap::new()));
    let client = AuthClient::new(dir.path(), dir.path().join("grok.json")).with_http(http.clone());
    assert_eq!(client.list().unwrap(), None);
    assert!(http.requests.lock().unwrap().is_empty());
}

#[test]
fn signed_in_lists_remote_models() {
    let dir = tempfile::tempdir().unwrap();
    save_fresh_session(dir.path(), "at-1");
    let http = Arc::new(ScriptedHttp::new(HashMap::from([(
        "/models".into(),
        vec![(
            200,
            json!({"data": [{"id": "grok-4.7"}, {"id": "grok-4.7-build-fast"}]}),
        )],
    )])));
    let client = AuthClient::new(dir.path(), dir.path().join("grok.json")).with_http(http.clone());
    let models = client.list().unwrap().expect("signed in");
    let ids: Vec<_> = models.into_iter().map(|m| m.id).collect();
    assert_eq!(
        ids,
        vec!["grok-4.7".to_string(), "grok-4.7-build-fast".to_string()]
    );
    let reqs = http.requests.lock().unwrap();
    assert_eq!(reqs[0].0, "https://api.x.ai/v1/models");
    assert!(
        reqs[0]
            .1
            .iter()
            .any(|(k, v)| k == "authorization" && v == "at-1")
    );
}

#[test]
fn error_status_is_an_error() {
    let dir = tempfile::tempdir().unwrap();
    save_fresh_session(dir.path(), "at-1");
    let http = Arc::new(ScriptedHttp::new(HashMap::from([(
        "/models".into(),
        vec![(401, json!({"error": "unauthorized"}))],
    )])));
    let client = AuthClient::new(dir.path(), dir.path().join("grok.json")).with_http(http);
    assert!(client.list().is_err());
}

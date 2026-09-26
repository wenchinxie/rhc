use crate::host::extensions::auth::client::AuthClient;
use crate::host::extensions::auth::session::OAuthSession;
use crate::host::extensions::auth::store::TokenStore;
use crate::host::ports::auth::{Auth, AuthError};

#[test]
fn whoami_logged_out() {
    let dir = tempfile::tempdir().unwrap();
    let client = AuthClient::new(dir.path().join("auth.json"));
    assert!(client.snapshot().unwrap().is_none());
}

#[test]
fn logout_when_logged_out_ok() {
    let dir = tempfile::tempdir().unwrap();
    let client = AuthClient::new(dir.path().join("auth.json"));
    client.logout().unwrap();
    client.logout().unwrap();
}

#[test]
fn need_login_when_expired_without_refresh() {
    let dir = tempfile::tempdir().unwrap();
    let store = TokenStore::new(dir.path().join("auth.json"));
    store
        .save(&OAuthSession {
            access_token: "old".into(),
            refresh_token: None,
            expires_at: chrono::Utc::now() - chrono::Duration::hours(1),
            subject: "s".into(),
            email: None,
            issuer: crate::host::extensions::auth::xai_client::ISSUER.into(),
            client_id: crate::host::extensions::auth::xai_client::CLIENT_ID.into(),
        })
        .unwrap();
    let client = AuthClient::new(dir.path().join("auth.json"));
    let err = client.refresh_if_needed().unwrap_err();
    assert!(matches!(err, AuthError::NeedLogin));
}

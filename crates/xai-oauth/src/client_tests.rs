use crate::client::AuthClient;
use crate::error::AuthError;
use crate::session::Session;

#[test]
fn whoami_logged_out() {
    let dir = tempfile::tempdir().unwrap();
    let client = AuthClient::new(dir.path().join("auth.json"));
    assert!(matches!(client.load().unwrap(), Session::LoggedOut));
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
    let store = crate::store::TokenStore::new(dir.path().join("auth.json"));
    store
        .save(&crate::session::OAuthSession {
            access_token: "old".into(),
            refresh_token: None,
            expires_at: chrono::Utc::now() - chrono::Duration::hours(1),
            subject: "s".into(),
            email: None,
            issuer: crate::constants::ISSUER.into(),
            client_id: crate::constants::CLIENT_ID.into(),
        })
        .unwrap();
    let client = AuthClient::new(dir.path().join("auth.json"));
    let err = client
        .refresh_if_needed(client.load().unwrap())
        .unwrap_err();
    assert!(matches!(err, AuthError::NeedLogin));
}

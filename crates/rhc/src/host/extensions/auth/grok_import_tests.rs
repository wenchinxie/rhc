use serde_json::json;

use crate::host::extensions::auth::client::AuthClient;
use crate::host::extensions::auth::constants::GROK_SCOPE_KEY;
use crate::host::extensions::auth::store::TokenStore;

#[test]
fn from_grok_copies_key_not_refresh() {
    let dir = tempfile::tempdir().unwrap();
    let grok_path = dir.path().join("grok-auth.json");
    std::fs::write(
        &grok_path,
        serde_json::to_vec(&json!({
            GROK_SCOPE_KEY: {
                "key": "grok-access",
                "auth_mode": "oidc",
                "user_id": "user-9",
                "email": "g@x.ai",
                "expires_at": "2030-01-01T00:00:00Z",
                "refresh_token": "grok-refresh-must-not-copy",
            }
        }))
        .unwrap(),
    )
    .unwrap();
    let client = AuthClient::new(dir.path().join("auth.json")).with_grok_path(&grok_path);
    let snapshot = client.login_from_grok().unwrap();
    assert_eq!(snapshot.token, "grok-access");
    assert_eq!(snapshot.identity.email.as_deref(), Some("g@x.ai"));
    let saved = TokenStore::new(dir.path().join("auth.json"))
        .load()
        .unwrap()
        .expect("saved session");
    assert_eq!(saved.access_token, "grok-access");
    assert!(saved.refresh_token.is_none());
    let grok_raw = std::fs::read_to_string(&grok_path).unwrap();
    assert!(grok_raw.contains("grok-refresh-must-not-copy"));
}

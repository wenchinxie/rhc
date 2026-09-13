use serde_json::json;

use crate::client::AuthClient;
use crate::constants::GROK_SCOPE_KEY;
use crate::session::Session;

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
    let session = client.login_from_grok().unwrap();
    assert_eq!(session.access_token, "grok-access");
    assert!(session.refresh_token.is_none());
    assert_eq!(session.email.as_deref(), Some("g@x.ai"));
    let Session::OAuth(loaded) = client.load().unwrap() else {
        panic!("expected oauth");
    };
    assert!(loaded.refresh_token.is_none());
    let grok_raw = std::fs::read_to_string(&grok_path).unwrap();
    assert!(grok_raw.contains("grok-refresh-must-not-copy"));
}

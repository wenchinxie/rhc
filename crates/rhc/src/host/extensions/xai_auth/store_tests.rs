use std::os::unix::fs::PermissionsExt;

use chrono::{TimeZone, Utc};

use super::*;
use crate::host::extensions::xai_auth::provider::XAI;
use crate::host::extensions::xai_auth::session::OAuthSession;
use crate::host::ports::auth::AuthError;

fn sample() -> OAuthSession {
    OAuthSession {
        access_token: "access-1".into(),
        refresh_token: Some("refresh-1".into()),
        expires_at: Utc.with_ymd_and_hms(2030, 1, 1, 0, 0, 0).unwrap(),
        subject: "user-1".into(),
        email: Some("a@b.c".into()),
        issuer: XAI.issuer.into(),
        client_id: XAI.client_id.into(),
    }
}

#[test]
fn missing_store_is_logged_out() {
    let dir = tempfile::tempdir().unwrap();
    let store = TokenStore::new(dir.path().join("auth.json"));
    assert!(store.load().unwrap().is_none());
}

#[test]
fn empty_store_is_logged_out() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("auth.json");
    std::fs::write(&path, "").unwrap();
    let store = TokenStore::new(path);
    assert!(store.load().unwrap().is_none());
}

#[test]
fn corrupt_store_raises() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("auth.json");
    std::fs::write(&path, "{not json").unwrap();
    let store = TokenStore::new(path);
    assert!(matches!(store.load(), Err(AuthError::Message(_))));
}

#[test]
fn write_then_read_round_trip_mode_0600() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join(".rhc").join("auth.json");
    let store = TokenStore::new(&path);
    store.save(&sample()).unwrap();
    let loaded = store.load().unwrap().expect("saved session");
    assert_eq!(loaded.access_token, "access-1");
    assert_eq!(loaded.refresh_token.as_deref(), Some("refresh-1"));
    assert_eq!(loaded.subject, "user-1");
    let mode = std::fs::metadata(&path).unwrap().permissions().mode() & 0o777;
    assert_eq!(mode, 0o600);
    let parent = std::fs::metadata(path.parent().unwrap())
        .unwrap()
        .permissions()
        .mode()
        & 0o777;
    assert_eq!(parent, 0o700);
}

#[test]
fn logout_twice_ok() {
    let dir = tempfile::tempdir().unwrap();
    let store = TokenStore::new(dir.path().join("auth.json"));
    store.save(&sample()).unwrap();
    store.clear().unwrap();
    store.clear().unwrap();
    assert!(store.load().unwrap().is_none());
}

#[test]
fn saved_file_matches_wire_format() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("auth.json");
    TokenStore::new(&path).save(&sample()).unwrap();
    assert_eq!(
        std::fs::read_to_string(&path).unwrap(),
        r#"{
  "version": 1,
  "credential": {
    "kind": "oauth",
    "access_token": "access-1",
    "refresh_token": "refresh-1",
    "expires_at": "2030-01-01T00:00:00Z",
    "email": "a@b.c",
    "subject": "user-1",
    "issuer": "https://auth.x.ai",
    "client_id": "b1a00492-073a-47ea-816f-4c329264a828"
  }
}"#
    );
}

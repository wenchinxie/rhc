use std::os::unix::fs::PermissionsExt;

use chrono::{TimeZone, Utc};

use super::*;
use crate::host::extensions::auth::constants::{CLIENT_ID, ISSUER};
use crate::host::extensions::auth::error::AuthError;
use crate::host::extensions::auth::session::{OAuthSession, Session};

fn sample() -> OAuthSession {
    OAuthSession {
        access_token: "access-1".into(),
        refresh_token: Some("refresh-1".into()),
        expires_at: Utc.with_ymd_and_hms(2030, 1, 1, 0, 0, 0).unwrap(),
        subject: "user-1".into(),
        email: Some("a@b.c".into()),
        issuer: ISSUER.into(),
        client_id: CLIENT_ID.into(),
    }
}

#[test]
fn missing_store_is_logged_out() {
    let dir = tempfile::tempdir().unwrap();
    let store = TokenStore::new(dir.path().join("auth.json"));
    assert!(matches!(store.load().unwrap(), Session::LoggedOut));
}

#[test]
fn empty_store_is_logged_out() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("auth.json");
    std::fs::write(&path, "").unwrap();
    let store = TokenStore::new(path);
    assert!(matches!(store.load().unwrap(), Session::LoggedOut));
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
    let Session::OAuth(loaded) = store.load().unwrap() else {
        panic!("expected oauth");
    };
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
    assert!(matches!(store.load().unwrap(), Session::LoggedOut));
}

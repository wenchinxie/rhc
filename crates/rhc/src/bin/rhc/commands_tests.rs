use std::sync::Mutex;

use rhc::ports::auth::{CredentialSnapshot, Identity, Subscription};

use super::*;

struct FakeAuth {
    identity: Mutex<Option<Identity>>,
}

impl FakeAuth {
    fn new() -> Self {
        Self {
            identity: Mutex::new(None),
        }
    }

    fn signed_in(email: &str) -> Self {
        let auth = Self::new();
        *auth.identity.lock().unwrap() = Some(Identity {
            subject: "sub".to_string(),
            email: Some(email.to_string()),
            issuer: "https://issuer.example".to_string(),
        });
        auth
    }
}

impl Auth for FakeAuth {
    fn subscription(&self) -> Subscription {
        Subscription::SuperGrok
    }

    fn snapshot(&self) -> Result<Option<CredentialSnapshot>, AuthError> {
        Ok(self
            .identity
            .lock()
            .unwrap()
            .clone()
            .map(|identity| CredentialSnapshot {
                token: "tok".to_string(),
                identity,
            }))
    }

    fn login(&self) -> Result<CredentialSnapshot, AuthError> {
        let identity = Identity {
            subject: "sub".to_string(),
            email: Some("logged-in@x.ai".to_string()),
            issuer: "https://issuer.example".to_string(),
        };
        *self.identity.lock().unwrap() = Some(identity.clone());
        Ok(CredentialSnapshot {
            token: "tok".to_string(),
            identity,
        })
    }

    fn logout(&self) -> Result<(), AuthError> {
        *self.identity.lock().unwrap() = None;
        Ok(())
    }

    fn refresh_if_needed(&self) -> Result<Option<CredentialSnapshot>, AuthError> {
        self.snapshot()
    }
}

#[test]
fn rows_with_zero_signed_in() {
    let a = FakeAuth::new();
    let bb = FakeAuth::new();
    let entries: [(&str, &dyn Auth); 2] = [("a", &a), ("bb", &bb)];
    assert_eq!(rows(&entries), "a   not signed in\nbb  not signed in\n");
}

#[test]
fn rows_with_one_signed_in() {
    let a = FakeAuth::signed_in("a@x.ai");
    let bb = FakeAuth::new();
    let entries: [(&str, &dyn Auth); 2] = [("a", &a), ("bb", &bb)];
    assert_eq!(
        rows(&entries),
        "a   signed in as a@x.ai\nbb  not signed in\n"
    );
}

#[test]
fn rows_with_two_signed_in() {
    let a = FakeAuth::signed_in("a@x.ai");
    let bb = FakeAuth::signed_in("bb@x.ai");
    let entries: [(&str, &dyn Auth); 2] = [("a", &a), ("bb", &bb)];
    assert_eq!(
        rows(&entries),
        "a   signed in as a@x.ai\nbb  signed in as bb@x.ai\n"
    );
}

#[test]
fn logout_of_one_entry_leaves_the_other_untouched() {
    let a = FakeAuth::signed_in("a@x.ai");
    let bb = FakeAuth::signed_in("bb@x.ai");
    let entries: [(&str, &dyn Auth); 2] = [("a", &a), ("bb", &bb)];
    logout(&entries, Some("bb")).unwrap();
    assert_eq!(
        rows(&entries),
        "a   signed in as a@x.ai\nbb  not signed in\n"
    );
}

#[test]
fn choose_by_number() {
    let a = FakeAuth::new();
    let bb = FakeAuth::new();
    let entries: [(&str, &dyn Auth); 2] = [("a", &a), ("bb", &bb)];
    let (name, _) = choose(&entries, "2").unwrap();
    assert_eq!(name, "bb");
}

#[test]
fn choose_by_name() {
    let a = FakeAuth::new();
    let bb = FakeAuth::new();
    let entries: [(&str, &dyn Auth); 2] = [("a", &a), ("bb", &bb)];
    let (name, _) = choose(&entries, "a").unwrap();
    assert_eq!(name, "a");
}

#[test]
fn choose_out_of_range() {
    let a = FakeAuth::new();
    let bb = FakeAuth::new();
    let entries: [(&str, &dyn Auth); 2] = [("a", &a), ("bb", &bb)];
    let err = choose(&entries, "3").err().unwrap();
    assert_eq!(err.to_string(), "no such choice: 3");
}

#[test]
fn find_unknown_name() {
    let a = FakeAuth::new();
    let bb = FakeAuth::new();
    let entries: [(&str, &dyn Auth); 2] = [("a", &a), ("bb", &bb)];
    let err = find(&entries, "c").err().unwrap();
    assert_eq!(
        err.to_string(),
        "unknown subscription: c (choose from: a, bb)"
    );
}

use rhc::ports::auth::Auth;

use super::*;
use crate::fake_auth::FakeAuth;

#[test]
fn logout_of_one_entry_leaves_the_other_untouched() {
    let a = FakeAuth::signed_in("a@x.ai");
    let bb = FakeAuth::signed_in("bb@x.ai");
    let entries: [(&str, &dyn Auth); 2] = [("a", &a), ("bb", &bb)];
    logout(&entries, Some("bb")).unwrap();
    assert_eq!(
        terminal::rows(&entries),
        "a   signed in as a@x.ai\nbb  not signed in\n"
    );
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

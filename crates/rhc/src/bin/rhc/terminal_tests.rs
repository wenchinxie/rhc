use super::*;
use crate::fake_auth::FakeAuth;

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

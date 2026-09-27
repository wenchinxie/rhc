use std::fs;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

const V1_STORE: &str = r#"{
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
}"#;

const GROK_STORE: &str = r#"{"https://auth.x.ai::b1a00492-073a-47ea-816f-4c329264a828": {"key": "grok-access", "user_id": "user-9", "email": "g@x.ai", "expires_at": "2030-01-01T00:00:00Z", "refresh_token": "must-not-copy"}}"#;

fn run(home: &Path, args: &[&str]) -> (i32, String, String) {
    run_with_env(
        &[("HOME", home), ("GROK_AUTH_PATH", &home.join("grok.json"))],
        args,
    )
}

fn run_with_env(env: &[(&str, &Path)], args: &[&str]) -> (i32, String, String) {
    let output = Command::new(env!("CARGO_BIN_EXE_rhc"))
        .args(args)
        .env_clear()
        .envs(env.iter().copied())
        .stdin(Stdio::null())
        .output()
        .expect("run rhc");
    (
        output.status.code().unwrap_or(-1),
        String::from_utf8(output.stdout).unwrap(),
        String::from_utf8(output.stderr).unwrap(),
    )
}

fn write_v1_store(home: &Path) -> PathBuf {
    let dir = home.join(".rhc");
    fs::create_dir_all(&dir).unwrap();
    let path = dir.join("auth.json");
    fs::write(&path, V1_STORE).unwrap();
    path
}

#[test]
fn whoami_with_no_store() {
    let home = tempfile::tempdir().unwrap();
    let (code, stdout, stderr) = run(home.path(), &["whoami"]);
    assert_eq!(code, 0);
    assert_eq!(stdout, "supergrok  not signed in\n");
    assert_eq!(stderr, "");
}

#[test]
fn login_without_a_name_asks_you_to_pick_one() {
    let home = tempfile::tempdir().unwrap();
    let (code, stdout, stderr) = run(home.path(), &["login"]);
    assert_eq!(code, 1);
    assert_eq!(stdout, "");
    assert_eq!(
        stderr,
        "choose a subscription: rhc login <subscription>\nsupergrok  not signed in\n"
    );
}

#[test]
fn login_with_an_unknown_name_fails() {
    let home = tempfile::tempdir().unwrap();
    let (code, stdout, stderr) = run(home.path(), &["login", "nope"]);
    assert_eq!(code, 1);
    assert_eq!(stdout, "");
    assert_eq!(
        stderr,
        "unknown subscription: nope (choose from: supergrok)\n"
    );
}

#[test]
fn whoami_reads_the_v1_store() {
    let home = tempfile::tempdir().unwrap();
    let auth_path = write_v1_store(home.path());

    let (code, stdout, stderr) = run(home.path(), &["whoami"]);
    assert_eq!(code, 0);
    assert_eq!(stdout, "supergrok  signed in as a@b.c\n");
    assert_eq!(stderr, "");

    let (code, stdout, stderr) = run(home.path(), &["whoami", "supergrok"]);
    assert_eq!(code, 0);
    assert_eq!(
        stdout,
        "subject: user-1\nemail: a@b.c\nissuer: https://auth.x.ai\n"
    );
    assert_eq!(stderr, "");

    assert_eq!(fs::read_to_string(&auth_path).unwrap(), V1_STORE);
}

#[test]
fn whoami_marks_a_corrupt_store_and_exits_nonzero() {
    let home = tempfile::tempdir().unwrap();
    fs::create_dir_all(home.path().join(".rhc")).unwrap();
    fs::write(home.path().join(".rhc/auth.json"), "{not json").unwrap();
    let (code, stdout, stderr) = run(home.path(), &["whoami"]);
    assert_eq!(code, 1);
    assert_eq!(
        stdout,
        "supergrok  error: corrupt auth store: key must be a string at line 1 column 2\n"
    );
    assert_eq!(stderr, "");
}

#[test]
fn login_from_grok_copies_the_access_token_not_the_refresh_token() {
    let home = tempfile::tempdir().unwrap();
    fs::write(home.path().join("grok.json"), GROK_STORE).unwrap();

    let (code, stdout, stderr) = run(home.path(), &["login", "--from-grok"]);
    assert_eq!(code, 0);
    assert_eq!(stdout, "supergrok  signed in as g@x.ai\n");
    assert_eq!(stderr, "");

    let (code, stdout, stderr) = run(home.path(), &["whoami"]);
    assert_eq!(code, 0);
    assert_eq!(stdout, "supergrok  signed in as g@x.ai\n");
    assert_eq!(stderr, "");

    let (code, stdout, stderr) = run(home.path(), &["logout", "supergrok"]);
    assert_eq!(code, 0);
    assert_eq!(stdout, "");
    assert_eq!(stderr, "");

    let (code, stdout, stderr) = run(home.path(), &["whoami"]);
    assert_eq!(code, 0);
    assert_eq!(stdout, "supergrok  not signed in\n");
    assert_eq!(stderr, "");
}

#[test]
fn models_lists_supergrok_catalog() {
    let home = tempfile::tempdir().unwrap();
    let (code, stdout, stderr) = run(home.path(), &["models"]);
    assert_eq!(code, 0);
    assert_eq!(
        stdout,
        "supergrok\n  grok-4.7  Grok 4.7  (default)\n  grok-4.7-build-fast  Grok 4.7 Fast\n  grok-4.6  Grok 4.6\n  grok-4.5  Grok 4.5\n"
    );
    assert_eq!(stderr, "");
}

#[test]
fn logout_without_a_name_clears_the_store() {
    let home = tempfile::tempdir().unwrap();
    let auth_path = write_v1_store(home.path());

    let (code, stdout, stderr) = run(home.path(), &["logout"]);
    assert_eq!(code, 0);
    assert_eq!(stdout, "");
    assert_eq!(stderr, "");

    assert!(!auth_path.exists());

    let (code, stdout, stderr) = run(home.path(), &["whoami"]);
    assert_eq!(code, 0);
    assert_eq!(stdout, "supergrok  not signed in\n");
    assert_eq!(stderr, "");
}

#[test]
fn from_grok_reads_grok_home_when_no_auth_path_is_set() {
    let home = tempfile::tempdir().unwrap();
    let grok_home = home.path().join("grok-home");
    fs::create_dir_all(&grok_home).unwrap();
    fs::write(grok_home.join("auth.json"), GROK_STORE).unwrap();
    let (code, stdout, stderr) = run_with_env(
        &[("HOME", home.path()), ("GROK_HOME", &grok_home)],
        &["login", "--from-grok"],
    );
    assert_eq!(code, 0);
    assert_eq!(stdout, "supergrok  signed in as g@x.ai\n");
    assert_eq!(stderr, "");
}

#[test]
fn from_grok_falls_back_to_dot_grok_under_home() {
    let home = tempfile::tempdir().unwrap();
    fs::create_dir_all(home.path().join(".grok")).unwrap();
    fs::write(home.path().join(".grok/auth.json"), GROK_STORE).unwrap();
    let (code, stdout, stderr) = run_with_env(&[("HOME", home.path())], &["login", "--from-grok"]);
    assert_eq!(code, 0);
    assert_eq!(stdout, "supergrok  signed in as g@x.ai\n");
    assert_eq!(stderr, "");
    assert!(home.path().join(".rhc/auth.json").exists());
}

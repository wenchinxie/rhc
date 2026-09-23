use std::io::{IsTerminal, Write};
use std::process::ExitCode;

use clap::{Parser, Subcommand};

use rhc::auth::AuthClient;
use rhc::ports::auth::{Auth, AuthError};
use rhc::ports::models::ModelCatalog;
use rhc::{auth, models};

type Entries<'a> = &'a [(&'a str, &'a dyn Auth)];

#[derive(Parser)]
#[command(name = "rhc", about = "rhc, a personal coding-agent harness")]
struct Cli {
    #[command(subcommand)]
    cmd: Cmd,
}

#[derive(Subcommand)]
enum Cmd {
    /// Sign in to a subscription (asks which one when none is given)
    Login {
        /// Subscription to sign in to, e.g. supergrok
        subscription: Option<String>,
        /// Copy the Grok Build access token into supergrok (not the refresh token)
        #[arg(long, conflicts_with = "subscription")]
        from_grok: bool,
    },
    /// Sign out of one subscription, or all of them
    Logout { subscription: Option<String> },
    /// Show every subscription's sign-in state, or one subscription's identity
    Whoami { subscription: Option<String> },
    /// List models for every subscription, or one
    Models { subscription: Option<String> },
}

fn main() -> ExitCode {
    let cli = Cli::parse();
    let supergrok = auth::start();
    let entries: [(&str, &dyn Auth); 1] = [(supergrok.subscription().id(), &supergrok)];
    match run(cli, &entries, &supergrok) {
        Ok(code) => code,
        Err(e) => {
            eprintln!("{e}");
            ExitCode::FAILURE
        }
    }
}

fn run(cli: Cli, entries: Entries, supergrok: &AuthClient) -> Result<ExitCode, AuthError> {
    match cli.cmd {
        Cmd::Login {
            subscription,
            from_grok,
        } => {
            cmd_login(entries, supergrok, subscription, from_grok)?;
            Ok(ExitCode::SUCCESS)
        }
        Cmd::Logout { subscription } => {
            cmd_logout(entries, subscription)?;
            Ok(ExitCode::SUCCESS)
        }
        Cmd::Whoami { subscription } => cmd_whoami(entries, subscription),
        Cmd::Models { subscription } => {
            cmd_models(entries, subscription)?;
            Ok(ExitCode::SUCCESS)
        }
    }
}

fn cmd_login(
    entries: Entries,
    supergrok: &AuthClient,
    subscription: Option<String>,
    from_grok: bool,
) -> Result<(), AuthError> {
    let printed = if from_grok {
        supergrok.login_from_grok()?;
        let name = supergrok.subscription().id();
        row(name, name.len(), supergrok).0
    } else if let Some(name) = subscription {
        let auth = find(entries, &name)?;
        auth.login()?;
        row(&name, name.len(), auth).0
    } else if std::io::stdin().is_terminal() {
        let (name, auth) = prompt_choice(entries)?;
        auth.login()?;
        row(name, name.len(), auth).0
    } else {
        return Err(no_subscription_chosen(entries));
    };
    println!("{printed}");
    Ok(())
}

fn cmd_logout(entries: Entries, subscription: Option<String>) -> Result<(), AuthError> {
    match subscription {
        Some(name) => find(entries, &name)?.logout(),
        None => {
            for (_, auth) in entries {
                auth.logout()?;
            }
            Ok(())
        }
    }
}

fn cmd_whoami(entries: Entries, subscription: Option<String>) -> Result<ExitCode, AuthError> {
    match subscription {
        Some(name) => {
            let auth = find(entries, &name)?;
            match auth.snapshot()? {
                Some(snapshot) => {
                    println!("subject: {}", snapshot.identity.subject);
                    if let Some(email) = snapshot.identity.email {
                        println!("email: {email}");
                    }
                    println!("issuer: {}", snapshot.identity.issuer);
                }
                None => println!("not signed in"),
            }
            Ok(ExitCode::SUCCESS)
        }
        None => {
            let width = width_of(entries);
            let mut failed = false;
            for (name, auth) in entries {
                let (line, ok) = row(name, width, *auth);
                println!("{line}");
                failed |= !ok;
            }
            Ok(if failed {
                ExitCode::FAILURE
            } else {
                ExitCode::SUCCESS
            })
        }
    }
}

fn cmd_models(entries: Entries, subscription: Option<String>) -> Result<(), AuthError> {
    let catalog = models::start();
    match subscription {
        Some(name) => {
            let auth = find(entries, &name)?;
            print_model_block(&catalog, &name, auth);
        }
        None => {
            for (name, auth) in entries {
                print_model_block(&catalog, name, *auth);
            }
        }
    }
    Ok(())
}

fn print_model_block(catalog: &dyn ModelCatalog, name: &str, auth: &dyn Auth) {
    println!("{name}");
    let subscription = auth.subscription();
    let default_id = catalog.default_for(subscription).map(|m| m.id);
    for model in catalog.models_for(subscription) {
        let suffix = if Some(&model.id) == default_id.as_ref() {
            "  (default)"
        } else {
            ""
        };
        println!("  {}  {}{suffix}", model.id, model.name);
    }
}

fn prompt_choice<'a>(entries: Entries<'a>) -> Result<(&'a str, &'a dyn Auth), AuthError> {
    let width = width_of(entries);
    for (i, (name, auth)) in entries.iter().enumerate() {
        eprintln!("{}) {}", i + 1, row(name, width, *auth).0);
    }
    eprint!("choose a subscription [1-{}]: ", entries.len());
    std::io::stderr().flush()?;
    let mut line = String::new();
    std::io::stdin().read_line(&mut line)?;
    choose(entries, line.trim())
}

fn no_subscription_chosen(entries: Entries) -> AuthError {
    AuthError::msg(format!(
        "choose a subscription: rhc login <subscription>\n{}",
        rows(entries).trim_end_matches('\n')
    ))
}

fn find<'a>(entries: Entries<'a>, name: &str) -> Result<&'a dyn Auth, AuthError> {
    entries
        .iter()
        .find(|(n, _)| *n == name)
        .map(|(_, auth)| *auth)
        .ok_or_else(|| unknown_subscription(entries, name))
}

fn unknown_subscription(entries: Entries, name: &str) -> AuthError {
    let names: Vec<&str> = entries.iter().map(|(n, _)| *n).collect();
    AuthError::msg(format!(
        "unknown subscription: {name} (choose from: {})",
        names.join(", ")
    ))
}

fn choose<'a>(entries: Entries<'a>, answer: &str) -> Result<(&'a str, &'a dyn Auth), AuthError> {
    if let Ok(n) = answer.parse::<usize>()
        && (1..=entries.len()).contains(&n)
    {
        return Ok(entries[n - 1]);
    }
    entries
        .iter()
        .find(|(name, _)| *name == answer)
        .copied()
        .ok_or_else(|| AuthError::msg(format!("no such choice: {answer}")))
}

fn width_of(entries: Entries) -> usize {
    entries
        .iter()
        .map(|(name, _)| name.len())
        .max()
        .unwrap_or(0)
}

fn row(name: &str, width: usize, auth: &dyn Auth) -> (String, bool) {
    let (state, ok) = match auth.snapshot() {
        Ok(Some(snapshot)) => (
            format!(
                "signed in as {}",
                snapshot
                    .identity
                    .email
                    .as_deref()
                    .unwrap_or(&snapshot.identity.subject)
            ),
            true,
        ),
        Ok(None) => ("not signed in".to_string(), true),
        Err(e) => (format!("error: {e}"), false),
    };
    (format!("{name:<width$}  {state}"), ok)
}

fn rows(entries: Entries) -> String {
    let width = width_of(entries);
    entries
        .iter()
        .map(|(name, auth)| format!("{}\n", row(name, width, *auth).0))
        .collect()
}

#[cfg(test)]
mod tests {
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
        cmd_logout(&entries, Some("bb".to_string())).unwrap();
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
}

use std::io::{IsTerminal, Write};
use std::process::ExitCode;

use rhc::ports::auth::{Auth, AuthError};
use rhc::ports::models::ModelCatalog;

pub type Subscriptions<'a> = &'a [(&'a str, &'a dyn Auth)];

#[derive(Debug, thiserror::Error)]
pub enum CliError {
    #[error("unknown subscription: {name} (choose from: {choices})")]
    UnknownSubscription { name: String, choices: String },
    #[error("no such choice: {0}")]
    NoSuchChoice(String),
    #[error("choose a subscription: rhc login <subscription>\n{0}")]
    NoSubscriptionChosen(String),
    #[error(transparent)]
    Auth(#[from] AuthError),
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

pub fn login(subscriptions: Subscriptions, name: Option<&str>) -> Result<ExitCode, CliError> {
    let (name, auth) = match name {
        Some(name) => (name, find(subscriptions, name)?),
        None if std::io::stdin().is_terminal() => prompt_choice(subscriptions)?,
        None => {
            return Err(CliError::NoSubscriptionChosen(
                rows(subscriptions).trim_end_matches('\n').to_string(),
            ));
        }
    };
    auth.login()?;
    print_signed_in(name, auth)
}

pub fn print_signed_in(name: &str, auth: &dyn Auth) -> Result<ExitCode, CliError> {
    println!("{}", row(name, name.len(), auth).0);
    Ok(ExitCode::SUCCESS)
}

pub fn logout(subscriptions: Subscriptions, name: Option<&str>) -> Result<ExitCode, CliError> {
    match name {
        Some(name) => find(subscriptions, name)?.logout()?,
        None => {
            for (_, auth) in subscriptions {
                auth.logout()?;
            }
        }
    }
    Ok(ExitCode::SUCCESS)
}

pub fn whoami(subscriptions: Subscriptions, name: Option<&str>) -> Result<ExitCode, CliError> {
    let Some(name) = name else {
        let width = width_of(subscriptions);
        let mut failed = false;
        for (name, auth) in subscriptions {
            let (line, ok) = row(name, width, *auth);
            println!("{line}");
            failed |= !ok;
        }
        return Ok(if failed {
            ExitCode::FAILURE
        } else {
            ExitCode::SUCCESS
        });
    };
    match find(subscriptions, name)?.snapshot()? {
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

pub fn models(
    subscriptions: Subscriptions,
    catalog: &dyn ModelCatalog,
    name: Option<&str>,
) -> Result<ExitCode, CliError> {
    match name {
        Some(name) => print_model_block(catalog, name, find(subscriptions, name)?),
        None => {
            for (name, auth) in subscriptions {
                print_model_block(catalog, name, *auth);
            }
        }
    }
    Ok(ExitCode::SUCCESS)
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

fn prompt_choice<'a>(
    subscriptions: Subscriptions<'a>,
) -> Result<(&'a str, &'a dyn Auth), CliError> {
    let width = width_of(subscriptions);
    for (i, (name, auth)) in subscriptions.iter().enumerate() {
        eprintln!("{}) {}", i + 1, row(name, width, *auth).0);
    }
    eprint!("choose a subscription [1-{}]: ", subscriptions.len());
    std::io::stderr().flush()?;
    let mut line = String::new();
    std::io::stdin().read_line(&mut line)?;
    choose(subscriptions, line.trim())
}

fn find<'a>(subscriptions: Subscriptions<'a>, name: &str) -> Result<&'a dyn Auth, CliError> {
    subscriptions
        .iter()
        .find(|(n, _)| *n == name)
        .map(|(_, auth)| *auth)
        .ok_or_else(|| CliError::UnknownSubscription {
            name: name.to_string(),
            choices: subscriptions
                .iter()
                .map(|(n, _)| *n)
                .collect::<Vec<_>>()
                .join(", "),
        })
}

fn choose<'a>(
    subscriptions: Subscriptions<'a>,
    answer: &str,
) -> Result<(&'a str, &'a dyn Auth), CliError> {
    if let Ok(n) = answer.parse::<usize>()
        && (1..=subscriptions.len()).contains(&n)
    {
        return Ok(subscriptions[n - 1]);
    }
    subscriptions
        .iter()
        .find(|(name, _)| *name == answer)
        .copied()
        .ok_or_else(|| CliError::NoSuchChoice(answer.to_string()))
}

fn width_of(subscriptions: Subscriptions) -> usize {
    subscriptions
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

fn rows(subscriptions: Subscriptions) -> String {
    let width = width_of(subscriptions);
    subscriptions
        .iter()
        .map(|(name, auth)| format!("{}\n", row(name, width, *auth).0))
        .collect()
}

#[cfg(test)]
#[path = "commands_tests.rs"]
mod tests;

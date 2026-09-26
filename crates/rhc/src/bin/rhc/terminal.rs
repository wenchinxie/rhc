use std::io::Write;
use std::process::ExitCode;

use rhc::ports::auth::{Auth, CredentialSnapshot};
use rhc::ports::models::ModelCatalog;

use crate::{CliError, Subscriptions};

pub fn prompt_choice<'a>(
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

pub fn print_signed_in(name: &str, auth: &dyn Auth) -> Result<ExitCode, CliError> {
    println!("{}", row(name, name.len(), auth).0);
    Ok(ExitCode::SUCCESS)
}

pub fn print_status(subscriptions: Subscriptions) -> bool {
    let width = width_of(subscriptions);
    let mut all_ok = true;
    for (name, auth) in subscriptions {
        let (line, ok) = row(name, width, *auth);
        println!("{line}");
        all_ok &= ok;
    }
    all_ok
}

pub fn print_identity(snapshot: Option<CredentialSnapshot>) {
    match snapshot {
        Some(snapshot) => {
            println!("subject: {}", snapshot.identity.subject);
            if let Some(email) = snapshot.identity.email {
                println!("email: {email}");
            }
            println!("issuer: {}", snapshot.identity.issuer);
        }
        None => println!("not signed in"),
    }
}

pub fn print_model_block(catalog: &dyn ModelCatalog, name: &str, auth: &dyn Auth) {
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

pub fn rows(subscriptions: Subscriptions) -> String {
    let width = width_of(subscriptions);
    subscriptions
        .iter()
        .map(|(name, auth)| format!("{}\n", row(name, width, *auth).0))
        .collect()
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

fn width_of(subscriptions: Subscriptions) -> usize {
    subscriptions
        .iter()
        .map(|(name, _)| name.len())
        .max()
        .unwrap_or(0)
}

#[cfg(test)]
#[path = "terminal_tests.rs"]
mod tests;

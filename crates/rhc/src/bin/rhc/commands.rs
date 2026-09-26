use std::io::IsTerminal;
use std::process::ExitCode;

use rhc::ports::auth::Auth;
use rhc::ports::models::ModelCatalog;

use crate::terminal;
use crate::{CliError, Subscriptions};

pub fn login(subscriptions: Subscriptions, name: Option<&str>) -> Result<ExitCode, CliError> {
    let (name, auth) = match name {
        Some(name) => (name, find(subscriptions, name)?),
        None if std::io::stdin().is_terminal() => terminal::prompt_choice(subscriptions)?,
        None => {
            return Err(CliError::NoSubscriptionChosen(
                terminal::rows(subscriptions)
                    .trim_end_matches('\n')
                    .to_string(),
            ));
        }
    };
    auth.login()?;
    terminal::print_signed_in(name, auth)
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
        return Ok(if terminal::print_status(subscriptions) {
            ExitCode::SUCCESS
        } else {
            ExitCode::FAILURE
        });
    };
    terminal::print_identity(find(subscriptions, name)?.snapshot()?);
    Ok(ExitCode::SUCCESS)
}

pub fn models(
    subscriptions: Subscriptions,
    catalog: &dyn ModelCatalog,
    name: Option<&str>,
) -> Result<ExitCode, CliError> {
    match name {
        Some(name) => terminal::print_model_block(catalog, name, find(subscriptions, name)?),
        None => {
            for (name, auth) in subscriptions {
                terminal::print_model_block(catalog, name, *auth);
            }
        }
    }
    Ok(ExitCode::SUCCESS)
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

#[cfg(test)]
#[path = "commands_tests.rs"]
mod tests;

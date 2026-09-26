mod commands;

use std::path::PathBuf;
use std::process::ExitCode;

use clap::{Parser, Subcommand};
use rhc::ports::auth::Auth;
use rhc::ports::start_context::StartContext;
use rhc::root::{self, Host};

use commands::CliError;

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
    let host = root::start(&start_context());
    let subscriptions = host.subscriptions();
    let result = match cli.cmd {
        Cmd::Login {
            from_grok: true, ..
        } => login_from_grok(&host),
        Cmd::Login { subscription, .. } => commands::login(&subscriptions, subscription.as_deref()),
        Cmd::Logout { subscription } => commands::logout(&subscriptions, subscription.as_deref()),
        Cmd::Whoami { subscription } => commands::whoami(&subscriptions, subscription.as_deref()),
        Cmd::Models { subscription } => {
            commands::models(&subscriptions, host.catalog(), subscription.as_deref())
        }
    };
    match result {
        Ok(code) => code,
        Err(e) => {
            eprintln!("{e}");
            ExitCode::FAILURE
        }
    }
}

fn start_context() -> StartContext {
    let home = std::env::var_os("HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("."));
    let grok_auth_path = match (std::env::var("GROK_AUTH_PATH"), std::env::var("GROK_HOME")) {
        (Ok(path), _) => PathBuf::from(path),
        (Err(_), Ok(grok_home)) => PathBuf::from(grok_home).join("auth.json"),
        (Err(_), Err(_)) => home.join(".grok").join("auth.json"),
    };
    StartContext {
        rhc_home: home.join(".rhc"),
        grok_auth_path,
    }
}

fn login_from_grok(host: &Host) -> Result<ExitCode, CliError> {
    host.supergrok.login_from_grok()?;
    commands::print_signed_in(host.supergrok.subscription().id(), host.supergrok.as_ref())
}

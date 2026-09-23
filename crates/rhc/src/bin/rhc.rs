use clap::{Parser, Subcommand};
use rhc::ports::auth::{Auth, AuthError};
use rhc::ports::models::ModelCatalog;
use rhc::{auth, models};

#[derive(Parser)]
#[command(name = "rhc", about = "rhc SuperGrok OAuth client")]
struct Cli {
    #[command(subcommand)]
    cmd: Cmd,
}

#[derive(Subcommand)]
enum Cmd {
    /// Sign in with the xAI browser login
    Login {
        /// Copy the Grok Build access token (not the refresh token)
        #[arg(long)]
        from_grok: bool,
    },
    /// Clear the local rhc session
    Logout,
    /// Print the signed-in identity
    Whoami,
    /// List models for the active subscription
    Models,
}

fn main() {
    let cli = Cli::parse();
    if let Err(e) = run(cli) {
        eprintln!("{e}");
        std::process::exit(1);
    }
}

fn run(cli: Cli) -> Result<(), AuthError> {
    let client = auth::start();
    match cli.cmd {
        Cmd::Login { from_grok } => {
            let snapshot = if from_grok {
                client.login_from_grok()?
            } else {
                client.login()?
            };
            let ident = snapshot.identity;
            println!(
                "signed in as {}",
                ident.email.as_deref().unwrap_or(&ident.subject)
            );
        }
        Cmd::Logout => client.logout()?,
        Cmd::Whoami => match client.snapshot()? {
            None => println!("logged out"),
            Some(snapshot) => {
                let ident = snapshot.identity;
                println!("subject: {}", ident.subject);
                if let Some(email) = ident.email {
                    println!("email: {email}");
                }
                println!("issuer: {}", ident.issuer);
            }
        },
        Cmd::Models => {
            let catalog = models::start();
            let sub = client.subscription();
            if let Some(default) = catalog.default_for(sub) {
                println!("default: {}", default.id);
            }
            for model in catalog.models_for(sub) {
                println!("{}  {}", model.id, model.name);
            }
        }
    }
    Ok(())
}

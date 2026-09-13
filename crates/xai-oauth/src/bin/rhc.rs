use clap::{Parser, Subcommand};
use xai_oauth::{AuthClient, AuthError, Session};

#[derive(Parser)]
#[command(name = "rhc", about = "rhc SuperGrok OAuth client")]
struct Cli {
    #[command(subcommand)]
    cmd: Cmd,
}

#[derive(Subcommand)]
enum Cmd {
    /// Sign in with xAI device-code OAuth
    Login {
        /// Copy the Grok Build access token (not the refresh token)
        #[arg(long)]
        from_grok: bool,
    },
    /// Clear the local rhc session
    Logout,
    /// Print the signed-in identity
    Whoami,
}

fn main() {
    let cli = Cli::parse();
    if let Err(e) = run(cli) {
        eprintln!("{e}");
        std::process::exit(1);
    }
}

fn run(cli: Cli) -> Result<(), AuthError> {
    let client = AuthClient::default();
    match cli.cmd {
        Cmd::Login { from_grok } => {
            let session = if from_grok {
                client.login_from_grok()?
            } else {
                client.login()?
            };
            let ident = session.identity();
            println!(
                "signed in as {}",
                ident.email.as_deref().unwrap_or(&ident.subject)
            );
        }
        Cmd::Logout => client.logout()?,
        Cmd::Whoami => match client.load()? {
            Session::LoggedOut => println!("logged out"),
            Session::OAuth(s) => {
                let ident = s.identity();
                println!("subject: {}", ident.subject);
                if let Some(email) = ident.email {
                    println!("email: {email}");
                }
                println!("issuer: {}", ident.issuer);
            }
        },
    }
    Ok(())
}

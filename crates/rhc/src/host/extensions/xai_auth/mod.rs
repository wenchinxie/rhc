mod client;
mod grok_import;
mod http;
mod oidc;
mod provider;
#[cfg(test)]
mod scripted_http;
mod session;
mod store;

pub use client::AuthClient;

use crate::host::ports::start_context::StartContext;

pub fn start(ctx: &StartContext) -> AuthClient {
    AuthClient::new(&ctx.rhc_home, ctx.grok_auth_path.clone())
}

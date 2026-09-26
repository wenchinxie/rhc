mod client;
mod grok_import;
mod http;
mod oidc;
#[cfg(test)]
mod scripted_http;
mod session;
mod store;
mod xai_client;

pub use client::AuthClient;

use crate::host::ports::start_context::StartContext;

pub fn start(ctx: &StartContext) -> AuthClient {
    AuthClient::new(&ctx.rhc_home, ctx.grok_auth_path.clone())
}

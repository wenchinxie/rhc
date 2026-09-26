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

pub fn start() -> AuthClient {
    AuthClient::default()
}

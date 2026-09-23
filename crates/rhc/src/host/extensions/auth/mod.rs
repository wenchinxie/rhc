//! SuperGrok browser login behind `ports::auth::Auth`.

mod client;
mod constants;
mod grok_import;
mod headers;
mod http;
mod oidc;
#[cfg(test)]
mod scripted_http;
mod session;
mod store;

pub use client::AuthClient;
pub use constants::PROXY_BASE;
pub use headers::proxy_header_map;

pub fn start() -> AuthClient {
    AuthClient::default()
}

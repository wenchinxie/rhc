//! SuperGrok device-code login. Same declaration shape as a Grok Bot host extension.

pub const ID: &str = "auth";
pub const DEPENDENCIES: &[&str] = &[];

mod client;
pub(crate) mod constants;
mod error;
mod grok_import;
mod headers;
pub(crate) mod http;
mod oidc;
pub(crate) mod session;
pub(crate) mod store;

pub use client::AuthClient;
pub use constants::PROXY_BASE;
pub use error::AuthError;
pub use headers::proxy_header_map;
pub use session::{Identity, OAuthSession, Session};

pub fn start() -> AuthClient {
    AuthClient::default()
}

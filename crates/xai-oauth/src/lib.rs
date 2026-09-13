//! SuperGrok / Grok Build subscription OAuth for rhc.
//!
//! Device-code against `auth.x.ai`. Tokens live in `~/.rhc/auth.json`.

mod client;
mod constants;
mod error;
mod grok_import;
mod headers;
mod http;
mod oidc;
mod session;
mod store;

pub use client::AuthClient;
pub use constants::PROXY_BASE;
pub use error::AuthError;
pub use headers::proxy_header_map;
pub use session::{Identity, OAuthSession, Session};

#[cfg(test)]
mod test_support;

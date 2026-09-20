//! SuperGrok / Grok Build subscription OAuth for rhc.
//!
//! Device-code against `auth.x.ai`. Tokens live in `~/.rhc/auth.json`.
//! Login lives in `host/extensions/auth`, the Grok Bot host-extension slot.

mod host;

pub use host::extensions::auth::{
    AuthClient, AuthError, DEPENDENCIES, ID, Identity, OAuthSession, PROXY_BASE, Session,
    proxy_header_map, start,
};

#[cfg(test)]
mod test_support;

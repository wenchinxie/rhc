//! Host crate for rhc, a personal coding-agent harness.
//!
//! Callers use the contracts in `ports`. Each extension hands out its implementation
//! from `start()`. `auth` is SuperGrok login against `auth.x.ai`, with tokens in
//! `~/.rhc/auth.json`. `ports::auth` is the Grok Build `xai-grok-auth` analogue.
//! `models` lists the models each subscription offers.

mod host;

pub use host::extensions::{auth, models};
pub use host::ports;

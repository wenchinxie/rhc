//! Outbound-auth contract for subscriptions whose login rhc owns. Same job as
//! Grok Build's `xai-grok-auth`. SuperGrok implements it. A later Grok login implements it too.

use thiserror::Error;

/// Which subscription minted the credential. Callers branch on this, not on folder names.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Subscription {
    SuperGrok,
    Grok,
}

#[derive(Debug, Error)]
#[non_exhaustive]
pub enum AuthError {
    #[error("not logged in; run `rhc login`")]
    NeedLogin,
    #[error("refresh token rejected")]
    RefreshRevoked,
    #[error("{0}")]
    Message(String),
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

impl AuthError {
    pub fn msg(text: impl Into<String>) -> Self {
        Self::Message(text.into())
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Identity {
    pub subject: String,
    pub email: Option<String>,
    pub issuer: String,
}

/// A signed-in credential. Same idea as Grok Build `CredentialSnapshot`.
#[derive(Debug, Clone)]
pub struct CredentialSnapshot {
    pub token: String,
    pub identity: Identity,
}

/// One login provider. HTTP and the CLI talk to this, not to SuperGrok files.
/// `None` means logged out.
pub trait Auth: Send + Sync {
    fn subscription(&self) -> Subscription;
    fn snapshot(&self) -> Result<Option<CredentialSnapshot>, AuthError>;
    fn login(&self) -> Result<CredentialSnapshot, AuthError>;
    fn logout(&self) -> Result<(), AuthError>;
    fn refresh_if_needed(&self) -> Result<Option<CredentialSnapshot>, AuthError>;
}

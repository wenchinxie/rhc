use thiserror::Error;

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

#[derive(Debug, Clone)]
pub struct CredentialSnapshot {
    pub token: String,
    pub identity: Identity,
}

/// `None` means logged out.
pub trait Auth: Send + Sync {
    fn subscription(&self) -> Subscription;
    fn snapshot(&self) -> Result<Option<CredentialSnapshot>, AuthError>;
    fn login(&self) -> Result<CredentialSnapshot, AuthError>;
    fn logout(&self) -> Result<(), AuthError>;
    fn refresh_if_needed(&self) -> Result<Option<CredentialSnapshot>, AuthError>;
}

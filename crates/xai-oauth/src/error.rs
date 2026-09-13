use thiserror::Error;

#[derive(Debug, Error)]
#[non_exhaustive]
pub enum AuthError {
    #[error("not logged in; run `rhc login`")]
    NeedLogin,
    #[error("authorization denied")]
    DeviceCodeDenied,
    #[error("refresh token rejected")]
    RefreshRevoked,
    #[error("{0}")]
    Message(String),
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

impl AuthError {
    pub(crate) fn msg(text: impl Into<String>) -> Self {
        Self::Message(text.into())
    }
}

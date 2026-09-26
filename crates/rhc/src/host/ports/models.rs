use super::auth::{AuthError, Subscription};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ModelEntry {
    pub id: String,
    pub family: String,
    pub name: String,
}

pub trait ModelCatalog: Send + Sync {
    fn models_for(&self, subscription: Subscription) -> Vec<ModelEntry>;
    fn default_for(&self, subscription: Subscription) -> Option<ModelEntry>;
}

pub trait ModelLister: Send + Sync {
    /// `Ok(None)` means signed out, so nothing was fetched.
    fn list(&self) -> Result<Option<Vec<ModelEntry>>, AuthError>;
}

//! Model catalog contract. Implementations register rows. Callers look up by subscription.

use super::auth::Subscription;

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

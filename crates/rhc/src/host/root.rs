use std::sync::Arc;

use crate::host::extensions::models;
use crate::host::extensions::xai_auth::{self, AuthClient};
use crate::host::ports::auth::{Auth, AuthError};
use crate::host::ports::models::{ModelCatalog, ModelEntry, ModelLister};
use crate::host::ports::start_context::StartContext;

pub struct Host {
    pub supergrok: Arc<AuthClient>,
    catalog: Box<dyn ModelCatalog>,
}

pub fn start(ctx: &StartContext) -> Host {
    let supergrok = Arc::new(xai_auth::start(ctx));
    let lister: Box<dyn ModelLister> = Box::new(SupergrokModels(Arc::clone(&supergrok)));
    Host {
        supergrok,
        catalog: Box::new(models::start(lister)),
    }
}

impl Host {
    pub fn subscriptions(&self) -> [(&'static str, &dyn Auth); 1] {
        [(self.supergrok.subscription().id(), self.supergrok.as_ref())]
    }

    pub fn catalog(&self) -> &dyn ModelCatalog {
        self.catalog.as_ref()
    }
}

struct SupergrokModels(Arc<AuthClient>);

impl ModelLister for SupergrokModels {
    fn list(&self) -> Result<Option<Vec<ModelEntry>>, AuthError> {
        self.0.list()
    }
}

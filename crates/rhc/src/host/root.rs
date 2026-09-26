use crate::host::extensions::models;
use crate::host::extensions::xai_auth::{self, AuthClient};
use crate::host::ports::auth::Auth;
use crate::host::ports::models::ModelCatalog;
use crate::host::ports::start_context::StartContext;

pub struct Host {
    pub supergrok: AuthClient,
    catalog: Box<dyn ModelCatalog>,
}

pub fn start(ctx: &StartContext) -> Host {
    Host {
        supergrok: xai_auth::start(ctx),
        catalog: Box::new(models::start()),
    }
}

impl Host {
    pub fn subscriptions(&self) -> [(&'static str, &dyn Auth); 1] {
        [(self.supergrok.subscription().id(), &self.supergrok)]
    }

    pub fn catalog(&self) -> &dyn ModelCatalog {
        self.catalog.as_ref()
    }
}

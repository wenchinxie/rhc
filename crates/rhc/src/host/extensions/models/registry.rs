use serde::Deserialize;

use crate::host::ports::auth::Subscription;
use crate::host::ports::models::{ModelCatalog, ModelEntry};

const RAW: &str = include_str!("default_models.json");

#[derive(Deserialize)]
struct File {
    subscriptions: Subs,
}

#[derive(Deserialize)]
struct Subs {
    supergrok: Group,
}

#[derive(Deserialize)]
struct Group {
    default: String,
    models: Vec<Row>,
}

#[derive(Deserialize)]
struct Row {
    id: String,
    family: String,
    name: String,
}

struct JsonModelCatalog {
    file: File,
}

pub fn start() -> impl ModelCatalog {
    JsonModelCatalog {
        file: serde_json::from_str(RAW).expect("default_models.json"),
    }
}

impl JsonModelCatalog {
    fn group(&self, subscription: Subscription) -> &Group {
        match subscription {
            Subscription::SuperGrok => &self.file.subscriptions.supergrok,
        }
    }
}

impl ModelCatalog for JsonModelCatalog {
    fn models_for(&self, subscription: Subscription) -> Vec<ModelEntry> {
        self.group(subscription)
            .models
            .iter()
            .map(|row| ModelEntry {
                id: row.id.clone(),
                family: row.family.clone(),
                name: row.name.clone(),
            })
            .collect()
    }

    fn default_for(&self, subscription: Subscription) -> Option<ModelEntry> {
        let group = self.group(subscription);
        self.models_for(subscription)
            .into_iter()
            .find(|m| m.id == group.default)
    }
}

#[cfg(test)]
#[path = "registry_tests.rs"]
mod tests;

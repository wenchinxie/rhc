use serde::Deserialize;

use crate::host::ports::auth::Subscription;
use crate::host::ports::models::{ModelCatalog, ModelEntry, ModelLister};

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
    lister: Box<dyn ModelLister>,
}

pub fn start(lister: Box<dyn ModelLister>) -> impl ModelCatalog {
    JsonModelCatalog {
        file: serde_json::from_str(RAW).expect("default_models.json"),
        lister,
    }
}

impl JsonModelCatalog {
    fn group(&self, subscription: Subscription) -> &Group {
        match subscription {
            Subscription::SuperGrok => &self.file.subscriptions.supergrok,
        }
    }

    fn bundled(&self, subscription: Subscription) -> Vec<ModelEntry> {
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
}

impl ModelCatalog for JsonModelCatalog {
    fn models_for(&self, subscription: Subscription) -> Vec<ModelEntry> {
        let mut merged = self.bundled(subscription);
        // Union, not replace. Hermes found OAuth-callable models missing from /v1/models.
        if let Ok(Some(remote)) = self.lister.list() {
            for entry in remote {
                if !merged.iter().any(|m| m.id == entry.id) {
                    merged.push(entry);
                }
            }
        }
        merged
    }

    fn default_for(&self, subscription: Subscription) -> Option<ModelEntry> {
        let group = self.group(subscription);
        self.bundled(subscription)
            .into_iter()
            .find(|m| m.id == group.default)
    }
}

#[cfg(test)]
#[path = "registry_tests.rs"]
mod tests;

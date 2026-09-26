use crate::host::extensions::models::start;
use crate::host::ports::auth::{AuthError, Subscription};
use crate::host::ports::models::{ModelCatalog, ModelEntry, ModelLister};

const BUNDLED_IDS: [&str; 4] = ["grok-4.7", "grok-4.7-build-fast", "grok-4.6", "grok-4.5"];

struct FakeLister(Result<Option<Vec<ModelEntry>>, ()>);

impl ModelLister for FakeLister {
    fn list(&self) -> Result<Option<Vec<ModelEntry>>, AuthError> {
        match &self.0 {
            Ok(entries) => Ok(entries.clone()),
            Err(()) => Err(AuthError::msg("boom")),
        }
    }
}

fn ids_of(catalog: &dyn ModelCatalog) -> Vec<String> {
    catalog
        .models_for(Subscription::SuperGrok)
        .into_iter()
        .map(|m| m.id)
        .collect()
}

#[test]
fn signed_out_lists_bundled_only() {
    let catalog = start(Box::new(FakeLister(Ok(None))));
    assert_eq!(
        ids_of(&catalog),
        BUNDLED_IDS.map(String::from).to_vec()
    );
    assert_eq!(
        catalog.default_for(Subscription::SuperGrok).unwrap().id,
        "grok-4.7"
    );
}

#[test]
fn remote_models_are_merged_after_bundled() {
    let remote = vec![
        ModelEntry {
            id: "grok-4.7".into(),
            family: "xai".into(),
            name: "grok-4.7".into(),
        },
        ModelEntry {
            id: "grok-9".into(),
            family: "xai".into(),
            name: "grok-9".into(),
        },
    ];
    let catalog = start(Box::new(FakeLister(Ok(Some(remote)))));
    let mut expected = BUNDLED_IDS.map(String::from).to_vec();
    expected.push("grok-9".into());
    assert_eq!(ids_of(&catalog), expected);
    let grok9 = catalog
        .models_for(Subscription::SuperGrok)
        .into_iter()
        .find(|m| m.id == "grok-9")
        .unwrap();
    assert_eq!(grok9.name, "grok-9");
}

#[test]
fn lister_error_falls_back_to_bundled() {
    let catalog = start(Box::new(FakeLister(Err(()))));
    assert_eq!(
        ids_of(&catalog),
        BUNDLED_IDS.map(String::from).to_vec()
    );
}

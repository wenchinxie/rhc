use crate::host::extensions::models::start;
use crate::host::ports::auth::Subscription;
use crate::host::ports::models::ModelCatalog;

#[test]
fn supergrok_registers_grok_46() {
    let catalog = start();
    let ids: Vec<_> = catalog
        .models_for(Subscription::SuperGrok)
        .into_iter()
        .map(|m| m.id)
        .collect();
    assert!(ids.contains(&"grok-4.6".to_string()));
    assert_eq!(
        catalog.default_for(Subscription::SuperGrok).unwrap().id,
        "grok-4.6"
    );
}

#[test]
fn grok_subscription_has_a_row() {
    let catalog = start();
    assert!(!catalog.models_for(Subscription::Grok).is_empty());
}

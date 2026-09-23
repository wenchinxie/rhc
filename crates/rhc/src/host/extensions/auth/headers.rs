use std::collections::BTreeMap;

use super::constants::{TOKEN_AUTH_VALUE, client_identity};

pub fn proxy_header_map(access_token: &str) -> BTreeMap<String, String> {
    let identity = client_identity();
    BTreeMap::from([
        (
            "Authorization".to_string(),
            format!("Bearer {access_token}"),
        ),
        ("X-XAI-Token-Auth".to_string(), TOKEN_AUTH_VALUE.to_string()),
        ("User-Agent".to_string(), identity.clone()),
        ("x-grok-client-version".to_string(), identity),
    ])
}

#[cfg(test)]
#[path = "headers_tests.rs"]
mod tests;

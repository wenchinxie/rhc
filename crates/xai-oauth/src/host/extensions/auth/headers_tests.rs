use super::*;
use crate::host::extensions::auth::constants::TOKEN_AUTH_VALUE;

#[test]
fn oauth_headers() {
    let headers = proxy_header_map("tok");
    assert_eq!(headers.get("Authorization").unwrap(), "Bearer tok");
    assert_eq!(headers.get("X-XAI-Token-Auth").unwrap(), TOKEN_AUTH_VALUE);
    let ua = headers.get("User-Agent").unwrap();
    assert!(ua.starts_with("rhc/"));
    assert_eq!(headers.get("x-grok-client-version").unwrap(), ua);
    assert!(!headers.contains_key("x-grok-client-identifier"));
}

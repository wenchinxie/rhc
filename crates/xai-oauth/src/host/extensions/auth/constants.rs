pub const ISSUER: &str = "https://auth.x.ai";
pub const CLIENT_ID: &str = "b1a00492-073a-47ea-816f-4c329264a828";
pub const SCOPES: &str = "openid profile email offline_access grok-cli:access api:access";
pub const DEVICE_CODE_URL: &str = "https://auth.x.ai/oauth2/device/code";
pub const TOKEN_URL: &str = "https://auth.x.ai/oauth2/token";
pub const PROXY_BASE: &str = "https://cli-chat-proxy.grok.com/v1";
pub const REFERRER: &str = "grok-build";
pub const TOKEN_AUTH_VALUE: &str = "xai-grok-cli";
pub const DEVICE_GRANT_TYPE: &str = "urn:ietf:params:oauth:grant-type:device_code";
pub const GROK_SCOPE_KEY: &str = "https://auth.x.ai::b1a00492-073a-47ea-816f-4c329264a828";
pub const DEFAULT_POLL_INTERVAL_SECS: u64 = 5;
pub const SLOW_DOWN_INCREMENT_SECS: u64 = 5;
pub const HTTP_TIMEOUT_SECS: u64 = 30;
pub const DEFAULT_EXPIRES_IN_SECS: i64 = 3600;
pub const FRESHNESS_SKEW_SECS: i64 = 30;
pub const STORE_VERSION: u32 = 1;

pub fn package_version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

pub fn client_identity() -> String {
    format!("rhc/{}", package_version())
}

pub(crate) struct OAuthProvider {
    pub issuer: &'static str,
    pub client_id: &'static str,
    pub authorize_url: &'static str,
    pub token_url: &'static str,
    pub scopes: &'static str,
    pub api_base_url: &'static str,
}

pub(crate) const XAI: OAuthProvider = OAuthProvider {
    issuer: "https://auth.x.ai",
    client_id: "b1a00492-073a-47ea-816f-4c329264a828",
    authorize_url: "https://auth.x.ai/oauth2/authorize",
    token_url: "https://auth.x.ai/oauth2/token",
    scopes: "openid profile email offline_access grok-cli:access api:access",
    api_base_url: "https://api.x.ai/v1",
};

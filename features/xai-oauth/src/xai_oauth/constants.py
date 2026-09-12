from __future__ import annotations

import importlib.metadata

ISSUER = "https://auth.x.ai"
CLIENT_ID = "b1a00492-073a-47ea-816f-4c329264a828"
SCOPES = "openid profile email offline_access grok-cli:access api:access"
DEVICE_CODE_URL = "https://auth.x.ai/oauth2/device/code"
TOKEN_URL = "https://auth.x.ai/oauth2/token"
PROXY_BASE = "https://cli-chat-proxy.grok.com/v1"
REFERRER = "grok-build"
TOKEN_AUTH_VALUE = "xai-grok-cli"
GROK_SCOPE_KEY = f"{ISSUER}::{CLIENT_ID}"
DEVICE_GRANT_TYPE = "urn:ietf:params:oauth:grant-type:device_code"
DEFAULT_POLL_INTERVAL_SECS = 5
SLOW_DOWN_INCREMENT_SECS = 5
HTTP_TIMEOUT_SECS = 30.0
DEFAULT_EXPIRES_IN_SECS = 3600
FRESHNESS_SKEW_SECS = 30
PACKAGE_NAME = "rhc-xai-oauth"
FALLBACK_VERSION = "0.0.1"


def package_version() -> str:
    try:
        return importlib.metadata.version(PACKAGE_NAME)
    except importlib.metadata.PackageNotFoundError:
        return FALLBACK_VERSION


VERSION = package_version()

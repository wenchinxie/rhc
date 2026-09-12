from __future__ import annotations

from xai_oauth.constants import TOKEN_AUTH_VALUE, VERSION


def proxy_header_map(access_token: str, version: str = VERSION) -> dict[str, str]:
    identity = f"rhc/{version}"
    return {
        "Authorization": f"Bearer {access_token}",
        "X-XAI-Token-Auth": TOKEN_AUTH_VALUE,
        "User-Agent": identity,
        "x-grok-client-version": identity,
    }

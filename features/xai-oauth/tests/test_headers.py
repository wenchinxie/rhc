from __future__ import annotations

from datetime import UTC, datetime

import pytest

from xai_oauth.constants import TOKEN_AUTH_VALUE, VERSION
from xai_oauth.session import LoggedOut, NeedLogin, OAuthSession


def test_oauth_headers_exact_keys_values() -> None:
    session = OAuthSession(
        access_token="access-1",
        refresh_token=None,
        expires_at=datetime(2030, 1, 1, tzinfo=UTC),
        subject="user-1",
    )
    identity = f"rhc/{VERSION}"
    assert session.proxy_headers() == {
        "Authorization": "Bearer access-1",
        "X-XAI-Token-Auth": TOKEN_AUTH_VALUE,
        "User-Agent": identity,
        "x-grok-client-version": identity,
    }


def test_logged_out_proxy_headers_raises_need_login() -> None:
    with pytest.raises(NeedLogin):
        LoggedOut().proxy_headers()

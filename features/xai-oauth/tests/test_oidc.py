from __future__ import annotations

import json
from datetime import UTC, datetime
from io import StringIO
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs

import pytest

from xai_oauth.client import AuthClient
from xai_oauth.constants import (
    CLIENT_ID,
    DEVICE_GRANT_TYPE,
    REFERRER,
    SCOPES,
)
from xai_oauth.session import NeedLogin, OAuthSession, RefreshRevoked
from xai_oauth.store import TokenStore

FUTURE = datetime(2030, 1, 1, tzinfo=UTC)
PAST = datetime(2000, 1, 1, tzinfo=UTC)


class FakeResponse:
    def __init__(self, body: bytes, status: int) -> None:
        self._body = body
        self.status = status
        self.code = status

    def read(self) -> bytes:
        return self._body

    def getcode(self) -> int:
        return self.status

    def close(self) -> None:
        return None


class ScriptedOpener:
    def __init__(self, routes: dict[str, list[tuple[int, object]]]) -> None:
        self.routes = {key: list(queue) for key, queue in routes.items()}
        self.requests: list[Any] = []

    def __call__(self, request: Any, timeout: float | None = None) -> FakeResponse:
        self.requests.append(request)
        url = request.full_url
        for key, queue in self.routes.items():
            if key in url:
                if not queue:
                    raise AssertionError(f"no more responses for {key}")
                status, body = queue.pop(0)
                if isinstance(body, bytes):
                    raw = body
                elif isinstance(body, str):
                    raw = body.encode()
                else:
                    raw = json.dumps(body).encode()
                return FakeResponse(raw, status)
        raise AssertionError(f"no route for {url}")


def _form(request: Any) -> dict[str, list[str]]:
    return parse_qs(request.data.decode("ascii"), keep_blank_values=True)


def test_device_code_then_token_success(tmp_path: Path) -> None:
    opener = ScriptedOpener(
        {
            "/oauth2/device/code": [
                (
                    200,
                    {
                        "device_code": "dc-1",
                        "user_code": "ABCD-EFGH",
                        "verification_uri": "https://auth.x.ai/device",
                        "expires_in": 600,
                        "interval": 0,
                    },
                )
            ],
            "/oauth2/token": [
                (
                    200,
                    {
                        "access_token": "at-1",
                        "refresh_token": "rt-1",
                        "expires_in": 3600,
                        "token_type": "Bearer",
                    },
                )
            ],
        }
    )
    err = StringIO()
    client = AuthClient(
        tmp_path / "auth.json",
        opener=opener,
        sleep=lambda _s: None,
        stderr=err,
    )
    session = client.login()
    assert isinstance(session, OAuthSession)
    assert session.access_token == "at-1"
    assert session.refresh_token == "rt-1"
    stderr = err.getvalue()
    assert "https://auth.x.ai/device" in stderr
    assert "ABCD-EFGH" in stderr
    device_form = _form(opener.requests[0])
    assert device_form["client_id"] == [CLIENT_ID]
    assert device_form["scope"] == [SCOPES]
    assert device_form["referrer"] == [REFERRER]
    token_form = _form(opener.requests[1])
    assert token_form["grant_type"] == [DEVICE_GRANT_TYPE]
    assert token_form["device_code"] == ["dc-1"]
    assert token_form["client_id"] == [CLIENT_ID]


def test_refresh_if_needed_noop_when_fresh(tmp_path: Path) -> None:
    def boom(_request: Any, timeout: float | None = None) -> FakeResponse:
        raise AssertionError("refresh must not hit the network when fresh")

    store = TokenStore(tmp_path / "auth.json", opener=boom)
    session = OAuthSession(
        access_token="at-fresh",
        refresh_token="rt-1",
        expires_at=FUTURE,
        subject="user-1",
    ).bind(store, boom)
    store.save(session)
    loaded = store.load()
    assert isinstance(loaded, OAuthSession)
    assert loaded.refresh_if_needed() is loaded


def test_refresh_invalid_grant_clears_store(tmp_path: Path) -> None:
    opener = ScriptedOpener(
        {
            "/oauth2/token": [
                (400, {"error": "invalid_grant", "error_description": "revoked"})
            ]
        }
    )
    path = tmp_path / "auth.json"
    store = TokenStore(path, opener=opener)
    session = OAuthSession(
        access_token="at-old",
        refresh_token="rt-dead",
        expires_at=PAST,
        subject="user-1",
    ).bind(store, opener)
    store.save(session)
    with pytest.raises(RefreshRevoked):
        session.refresh_if_needed()
    client = AuthClient(path, opener=opener, sleep=lambda _s: None)
    from xai_oauth.session import LoggedOut

    assert isinstance(client.load(), LoggedOut)


def test_refresh_if_needed_need_login_without_refresh(tmp_path: Path) -> None:
    store = TokenStore(tmp_path / "auth.json")
    session = OAuthSession(
        access_token="at-old",
        refresh_token=None,
        expires_at=PAST,
        subject="user-1",
    ).bind(store)
    with pytest.raises(NeedLogin):
        session.refresh_if_needed()


def test_refresh_if_needed_writes_new_tokens(tmp_path: Path) -> None:
    opener = ScriptedOpener(
        {
            "/oauth2/token": [
                (
                    200,
                    {
                        "access_token": "at-new",
                        "refresh_token": "rt-new",
                        "expires_in": 3600,
                    },
                )
            ]
        }
    )
    store = TokenStore(tmp_path / "auth.json", opener=opener)
    session = OAuthSession(
        access_token="at-old",
        refresh_token="rt-old",
        expires_at=PAST,
        subject="user-1",
        email="a@b.c",
    ).bind(store, opener)
    store.save(session)
    refreshed = session.refresh_if_needed()
    assert isinstance(refreshed, OAuthSession)
    assert refreshed.access_token == "at-new"
    assert refreshed.refresh_token == "rt-new"
    loaded = store.load()
    assert isinstance(loaded, OAuthSession)
    assert loaded.access_token == "at-new"
    assert loaded.refresh_token == "rt-new"
    form = _form(opener.requests[0])
    assert form["grant_type"] == ["refresh_token"]
    assert form["refresh_token"] == ["rt-old"]
    assert form["client_id"] == [CLIENT_ID]


def test_refresh_if_needed_adopts_sibling_fresh_session(tmp_path: Path) -> None:
    def boom(_request: Any, timeout: float | None = None) -> FakeResponse:
        raise AssertionError("sibling already refreshed; must not spend the RT")

    store = TokenStore(tmp_path / "auth.json", opener=boom)
    fresh = OAuthSession(
        access_token="at-sibling",
        refresh_token="rt-2",
        expires_at=FUTURE,
        subject="user-1",
    ).bind(store, boom)
    store.save(fresh)
    stale = OAuthSession(
        access_token="at-old",
        refresh_token="rt-1",
        expires_at=PAST,
        subject="user-1",
    ).bind(store, boom)
    adopted = stale.refresh_if_needed()
    assert isinstance(adopted, OAuthSession)
    assert adopted.access_token == "at-sibling"

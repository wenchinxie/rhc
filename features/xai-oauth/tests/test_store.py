from __future__ import annotations

from datetime import UTC, datetime
from pathlib import Path

import pytest

from xai_oauth.client import AuthClient
from xai_oauth.session import AuthError, LoggedOut, OAuthSession
from xai_oauth.store import TokenStore

FUTURE = datetime(2030, 1, 1, tzinfo=UTC)


def _session() -> OAuthSession:
    return OAuthSession(
        access_token="access-1",
        refresh_token="refresh-1",
        expires_at=FUTURE,
        subject="user-1",
        email="a@b.c",
    )


def test_missing_store_is_logged_out(tmp_path: Path) -> None:
    store = TokenStore(tmp_path / "auth.json")
    assert isinstance(store.load(), LoggedOut)


def test_empty_store_is_logged_out(tmp_path: Path) -> None:
    path = tmp_path / "auth.json"
    path.write_text("", encoding="utf-8")
    store = TokenStore(path)
    assert isinstance(store.load(), LoggedOut)


def test_whitespace_store_is_logged_out(tmp_path: Path) -> None:
    path = tmp_path / "auth.json"
    path.write_text("\n  \n", encoding="utf-8")
    store = TokenStore(path)
    assert isinstance(store.load(), LoggedOut)


def test_corrupt_store_raises(tmp_path: Path) -> None:
    path = tmp_path / "auth.json"
    path.write_text("{not json", encoding="utf-8")
    store = TokenStore(path)
    with pytest.raises(AuthError):
        store.load()


def test_non_object_store_raises(tmp_path: Path) -> None:
    path = tmp_path / "auth.json"
    path.write_text("[]", encoding="utf-8")
    store = TokenStore(path)
    with pytest.raises(AuthError):
        store.load()


def test_write_then_read_round_trip_mode_0600(tmp_path: Path) -> None:
    path = tmp_path / ".rhc" / "auth.json"
    store = TokenStore(path)
    original = _session()
    store.save(original)
    loaded = store.load()
    assert isinstance(loaded, OAuthSession)
    assert loaded.access_token == "access-1"
    assert loaded.refresh_token == "refresh-1"
    assert loaded.expires_at == FUTURE
    assert loaded.subject == "user-1"
    assert loaded.email == "a@b.c"
    assert loaded.issuer == original.issuer
    assert loaded.client_id == original.client_id
    assert oct(path.stat().st_mode & 0o777) == "0o600"
    assert oct(path.parent.stat().st_mode & 0o777) == "0o700"


def test_logout_twice_ok(tmp_path: Path) -> None:
    path = tmp_path / "auth.json"
    client = AuthClient(path)
    client._store.save(_session().bind(client._store))
    client.logout()
    client.logout()
    assert isinstance(client.load(), LoggedOut)

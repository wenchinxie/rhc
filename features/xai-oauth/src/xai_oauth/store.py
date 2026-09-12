from __future__ import annotations

import fcntl
import json
import os
import tempfile
import time
import urllib.request
from collections.abc import Callable, Iterator
from contextlib import contextmanager
from pathlib import Path
from typing import Any

from xai_oauth.session import (
    AuthError,
    LoggedOut,
    OAuthSession,
    Session,
    format_expires_at,
    parse_expires_at,
)

STORE_VERSION = 1


def default_auth_path() -> Path:
    return Path.home() / ".rhc" / "auth.json"


class TokenStore:
    """Sole writer of ~/.rhc/auth.json."""

    def __init__(
        self,
        path: Path | None = None,
        *,
        opener: Callable[..., Any] | None = None,
        sleep: Callable[[float], None] | None = None,
    ) -> None:
        self.path = path if path is not None else default_auth_path()
        self._opener = opener if opener is not None else urllib.request.urlopen
        self._sleep = sleep if sleep is not None else time.sleep

    @property
    def lock_path(self) -> Path:
        return self.path.with_name(self.path.name + ".lock")

    def load(self) -> Session:
        try:
            raw = self.path.read_text(encoding="utf-8")
        except FileNotFoundError:
            return LoggedOut()
        except OSError as e:
            raise AuthError(f"cannot read {self.path}") from e
        if not raw.strip():
            # Empty file is a crash leftover (truncate before replace), not garbage.
            return LoggedOut()
        try:
            data = json.loads(raw)
        except json.JSONDecodeError as e:
            raise AuthError(f"corrupt auth store: {self.path}") from e
        session = _session_from_wire(data, self.path)
        if isinstance(session, OAuthSession):
            return session.bind(self, self._opener, self._sleep)
        return session

    def save(self, session: OAuthSession) -> None:
        payload = json.dumps(_to_wire(session), indent=2) + "\n"
        data = payload.encode("utf-8")
        parent = self.path.parent
        try:
            parent.mkdir(parents=True, exist_ok=True)
            os.chmod(parent, 0o700)
        except OSError as e:
            raise AuthError(f"cannot create {parent}") from e
        fd = -1
        tmp = ""
        try:
            fd, tmp = tempfile.mkstemp(
                prefix=".auth.json.",
                suffix=".tmp",
                dir=parent,
            )
            os.write(fd, data)
            os.fsync(fd)
            os.close(fd)
            fd = -1
            os.chmod(tmp, 0o600)
            os.replace(tmp, self.path)
            tmp = ""
            dir_fd = os.open(parent, os.O_DIRECTORY)
            try:
                os.fsync(dir_fd)
            finally:
                os.close(dir_fd)
        except OSError as e:
            raise AuthError(f"cannot write {self.path}") from e
        finally:
            if fd >= 0:
                os.close(fd)
            if tmp:
                try:
                    os.unlink(tmp)
                except FileNotFoundError:
                    pass

    def clear(self) -> None:
        try:
            self.path.unlink()
        except FileNotFoundError:
            return
        except OSError as e:
            raise AuthError(f"cannot clear {self.path}") from e

    @contextmanager
    def lock(self) -> Iterator[None]:
        parent = self.path.parent
        try:
            parent.mkdir(parents=True, exist_ok=True)
            os.chmod(parent, 0o700)
        except OSError as e:
            raise AuthError(f"cannot create {parent}") from e
        try:
            fd = os.open(self.lock_path, os.O_CREAT | os.O_RDWR, 0o600)
        except OSError as e:
            raise AuthError(f"cannot open {self.lock_path}") from e
        try:
            fcntl.flock(fd, fcntl.LOCK_EX)
            yield
        finally:
            fcntl.flock(fd, fcntl.LOCK_UN)
            os.close(fd)


def _to_wire(session: OAuthSession) -> dict[str, Any]:
    return {
        "version": STORE_VERSION,
        "credential": {
            "kind": "oauth",
            "access_token": session.access_token,
            "refresh_token": session.refresh_token,
            "expires_at": format_expires_at(session.expires_at),
            "email": session.email,
            "subject": session.subject,
            "issuer": session.issuer,
            "client_id": session.client_id,
        },
    }


def _session_from_wire(data: object, path: Path) -> Session:
    if not isinstance(data, dict):
        raise AuthError(f"corrupt auth store: {path}")
    if data.get("version") != STORE_VERSION:
        raise AuthError(f"unsupported auth.json version: {data.get('version')!r}")
    cred = data.get("credential")
    if not isinstance(cred, dict):
        raise AuthError(f"auth.json missing credential: {path}")
    if cred.get("kind") != "oauth":
        raise AuthError(f"unsupported credential kind: {cred.get('kind')!r}")
    access = _require_str(cred, "access_token", path)
    subject = _require_str(cred, "subject", path)
    issuer = _require_str(cred, "issuer", path)
    client_id = _require_str(cred, "client_id", path)
    expires_raw = cred.get("expires_at")
    if not isinstance(expires_raw, str) or not expires_raw:
        raise AuthError(f"auth.json missing expires_at: {path}")
    refresh = cred.get("refresh_token")
    if refresh is not None and not isinstance(refresh, str):
        raise AuthError(f"auth.json has invalid refresh_token: {path}")
    if refresh == "":
        refresh = None
    email = cred.get("email")
    if email is not None and not isinstance(email, str):
        raise AuthError(f"auth.json has invalid email: {path}")
    if email == "":
        email = None
    return OAuthSession(
        access_token=access,
        refresh_token=refresh,
        expires_at=parse_expires_at(expires_raw),
        subject=subject,
        email=email,
        issuer=issuer,
        client_id=client_id,
    )


def _require_str(cred: dict[str, Any], key: str, path: Path) -> str:
    value = cred.get(key)
    if not isinstance(value, str) or not value:
        raise AuthError(f"auth.json missing {key}: {path}")
    return value

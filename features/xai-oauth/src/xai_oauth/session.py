from __future__ import annotations

import base64
import json
from dataclasses import dataclass, field, replace
from datetime import UTC, datetime, timedelta
from typing import Any, Literal, NoReturn

from xai_oauth.constants import (
    CLIENT_ID,
    FRESHNESS_SKEW_SECS,
    ISSUER,
)
from xai_oauth.headers import proxy_header_map


class AuthError(Exception):
    """Root error for the rhc xAI OAuth client."""


class NeedLogin(AuthError):
    """No usable session; caller must run login."""


class DeviceCodeDenied(AuthError):
    """The user rejected the device-code request."""


class RefreshRevoked(AuthError):
    """IdP rejected the refresh token (invalid_grant)."""


@dataclass(frozen=True, slots=True, kw_only=True)
class Identity:
    subject: str
    email: str | None
    issuer: str


def claims_from_jwt(token: str) -> dict[str, Any]:
    parts = token.split(".")
    if len(parts) < 2:
        return {}
    payload = parts[1]
    pad = "=" * (-len(payload) % 4)
    try:
        raw = base64.urlsafe_b64decode(payload + pad)
        data = json.loads(raw)
    except (ValueError, json.JSONDecodeError):
        return {}
    if not isinstance(data, dict):
        return {}
    return data


def parse_expires_at(value: str) -> datetime:
    text = value.strip()
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError as e:
        raise AuthError(f"invalid expires_at: {value!r}") from e
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=UTC)
    return parsed.astimezone(UTC)


def format_expires_at(value: datetime) -> str:
    return (
        value.astimezone(UTC)
        .replace(microsecond=0)
        .strftime("%Y-%m-%dT%H:%M:%SZ")
    )


@dataclass(frozen=True, slots=True, kw_only=True)
class LoggedOut:
    kind: Literal["logged_out"] = "logged_out"

    def proxy_headers(self) -> NoReturn:
        raise NeedLogin("not logged in")

    def refresh_if_needed(self) -> LoggedOut:
        return self

    def identity(self) -> None:
        return None


@dataclass(frozen=True, slots=True, kw_only=True)
class OAuthSession:
    access_token: str
    refresh_token: str | None
    expires_at: datetime
    subject: str
    email: str | None = None
    issuer: str = ISSUER
    client_id: str = CLIENT_ID
    kind: Literal["oauth"] = "oauth"
    _store: Any = field(default=None, compare=False, repr=False)
    _opener: Any = field(default=None, compare=False, repr=False)
    _sleep: Any = field(default=None, compare=False, repr=False)

    def bind(
        self,
        store: object,
        opener: object | None = None,
        sleep: object | None = None,
    ) -> OAuthSession:
        return replace(
            self,
            _store=store,
            _opener=opener if opener is not None else self._opener,
            _sleep=sleep if sleep is not None else self._sleep,
        )

    def is_fresh(self, now: datetime | None = None) -> bool:
        clock = now if now is not None else datetime.now(UTC)
        expiry = self.expires_at
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=UTC)
        return expiry > clock + timedelta(seconds=FRESHNESS_SKEW_SECS)

    def proxy_headers(self) -> dict[str, str]:
        return proxy_header_map(self.access_token)

    def identity(self) -> Identity:
        return Identity(subject=self.subject, email=self.email, issuer=self.issuer)

    def refresh_if_needed(self) -> Session:
        if self.is_fresh():
            return self
        if not self.refresh_token:
            raise NeedLogin("access token expired; run rhc login")
        store = self._store
        if store is None:
            raise AuthError("session is not bound to a token store")
        with store.lock():
            current = store.load()
            if isinstance(current, OAuthSession) and current.is_fresh():
                return current.bind(store, self._opener, self._sleep)
            if not isinstance(current, OAuthSession) or not current.refresh_token:
                raise NeedLogin("access token expired; run rhc login")
            from xai_oauth.oidc import refresh_grant

            try:
                grant = refresh_grant(
                    current.refresh_token,
                    opener=self._opener or store._opener,
                )
            except RefreshRevoked:
                store.clear()
                raise
            new = OAuthSession(
                access_token=grant.access_token,
                refresh_token=grant.refresh_token or current.refresh_token,
                expires_at=grant.expires_at,
                email=grant.email if grant.email is not None else current.email,
                subject=grant.subject or current.subject,
                issuer=current.issuer,
                client_id=current.client_id,
            ).bind(store, self._opener, self._sleep)
            store.save(new)
            return new


Session = LoggedOut | OAuthSession

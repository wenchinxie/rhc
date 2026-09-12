from __future__ import annotations

import json
import os
from datetime import UTC, datetime, timedelta
from pathlib import Path

from xai_oauth.constants import (
    CLIENT_ID,
    DEFAULT_EXPIRES_IN_SECS,
    GROK_SCOPE_KEY,
    ISSUER,
)
from xai_oauth.session import (
    AuthError,
    OAuthSession,
    claims_from_jwt,
    parse_expires_at,
)


def resolve_grok_auth_path(explicit: Path | None = None) -> Path:
    if explicit is not None:
        return explicit
    env_path = os.environ.get("GROK_AUTH_PATH")
    if env_path:
        return Path(env_path)
    grok_home = os.environ.get("GROK_HOME")
    if grok_home:
        return Path(grok_home) / "auth.json"
    return Path.home() / ".grok" / "auth.json"


def import_oauth_from_grok(path: Path | None = None) -> OAuthSession:
    auth_path = resolve_grok_auth_path(path)
    try:
        raw = auth_path.read_text(encoding="utf-8")
    except FileNotFoundError as e:
        raise AuthError(f"grok auth file not found: {auth_path}") from e
    except OSError as e:
        raise AuthError(f"cannot read grok auth file: {auth_path}") from e
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise AuthError(f"corrupt grok auth file: {auth_path}") from e
    if not isinstance(data, dict):
        raise AuthError(f"corrupt grok auth file: {auth_path}")
    entry = data.get(GROK_SCOPE_KEY)
    if not isinstance(entry, dict):
        raise AuthError(f"no grok OAuth entry for {GROK_SCOPE_KEY}")
    access = entry.get("key")
    if not isinstance(access, str) or not access:
        raise AuthError("grok OAuth entry missing key")
    email = _optional_str(entry.get("email"))
    subject = _optional_str(entry.get("user_id")) or ""
    claims = claims_from_jwt(access)
    if not subject:
        sub = claims.get("sub")
        subject = sub if isinstance(sub, str) else ""
    if not subject:
        raise AuthError("grok OAuth entry missing user_id")
    if email is None:
        claim_email = claims.get("email")
        email = claim_email if isinstance(claim_email, str) else None
    expires_at = _expires_from_grok(entry, claims)
    return OAuthSession(
        access_token=access,
        refresh_token=None,
        expires_at=expires_at,
        subject=subject,
        email=email,
        issuer=ISSUER,
        client_id=CLIENT_ID,
    )


def _optional_str(value: object) -> str | None:
    if not isinstance(value, str) or not value:
        return None
    return value


def _expires_from_grok(entry: dict[str, object], claims: dict[str, object]) -> datetime:
    raw = entry.get("expires_at")
    if isinstance(raw, str) and raw:
        return parse_expires_at(raw)
    exp = claims.get("exp")
    if isinstance(exp, (int, float)) and not isinstance(exp, bool):
        return datetime.fromtimestamp(float(exp), tz=UTC)
    return datetime.now(UTC) + timedelta(seconds=DEFAULT_EXPIRES_IN_SECS)

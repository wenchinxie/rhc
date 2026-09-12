from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request
from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any, TextIO

from xai_oauth.constants import (
    CLIENT_ID,
    DEFAULT_EXPIRES_IN_SECS,
    DEFAULT_POLL_INTERVAL_SECS,
    DEVICE_CODE_URL,
    DEVICE_GRANT_TYPE,
    HTTP_TIMEOUT_SECS,
    ISSUER,
    REFERRER,
    SCOPES,
    SLOW_DOWN_INCREMENT_SECS,
    TOKEN_URL,
    VERSION,
)
from xai_oauth.session import (
    AuthError,
    DeviceCodeDenied,
    OAuthSession,
    RefreshRevoked,
    claims_from_jwt,
)


@dataclass(frozen=True, slots=True)
class TokenGrant:
    access_token: str
    refresh_token: str | None
    expires_at: datetime
    email: str | None
    subject: str


def run_device_code_flow(
    *,
    opener: Callable[..., Any],
    sleep: Callable[[float], None],
    stderr: TextIO,
) -> OAuthSession:
    device = _request_device_code(opener)
    complete = device.get("verification_uri_complete")
    if isinstance(complete, str) and complete:
        print(complete, file=stderr)
    else:
        print(device["verification_uri"], file=stderr)
    print(device["user_code"], file=stderr)
    grant = _poll_token(
        device_code=device["device_code"],
        interval=device["interval"],
        expires_in=device["expires_in"],
        opener=opener,
        sleep=sleep,
    )
    return _session_from_grant(grant)


def refresh_grant(refresh_token: str, *, opener: Callable[..., Any]) -> TokenGrant:
    status, data = _http_post_form(
        TOKEN_URL,
        {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": CLIENT_ID,
        },
        opener,
    )
    if isinstance(data, dict) and data.get("error") == "invalid_grant":
        raise RefreshRevoked("refresh token rejected")
    if status != 200:
        raise AuthError(_error_message(data, status, "refresh failed"))
    return _grant_from_token_payload(data)


def _session_from_grant(grant: TokenGrant) -> OAuthSession:
    return OAuthSession(
        access_token=grant.access_token,
        refresh_token=grant.refresh_token,
        expires_at=grant.expires_at,
        email=grant.email,
        subject=grant.subject,
        issuer=ISSUER,
        client_id=CLIENT_ID,
    )


def _request_device_code(opener: Callable[..., Any]) -> dict[str, Any]:
    status, data = _http_post_form(
        DEVICE_CODE_URL,
        {
            "client_id": CLIENT_ID,
            "scope": SCOPES,
            "referrer": REFERRER,
        },
        opener,
    )
    if status != 200 or not isinstance(data, dict):
        raise AuthError(_error_message(data, status, "device code request failed"))
    device_code = _require_str(data, "device_code")
    user_code = _require_str(data, "user_code")
    verification_uri = _require_str(data, "verification_uri")
    if not all(c.isalnum() or c == "-" for c in user_code):
        raise AuthError("server returned invalid user_code")
    _validate_verification_uri(verification_uri)
    complete = data.get("verification_uri_complete")
    if complete is not None:
        if not isinstance(complete, str) or not complete:
            raise AuthError("invalid verification_uri_complete")
        _validate_verification_uri(complete)
    expires_in = _as_int(data.get("expires_in"), "expires_in")
    if expires_in < 0:
        raise AuthError("invalid expires_in")
    interval_raw = data.get("interval")
    if interval_raw is None:
        interval = DEFAULT_POLL_INTERVAL_SECS
    else:
        interval = _as_int(interval_raw, "interval")
        if interval < 0:
            raise AuthError("invalid interval")
    result: dict[str, Any] = {
        "device_code": device_code,
        "user_code": user_code,
        "verification_uri": verification_uri,
        "expires_in": expires_in,
        "interval": interval,
    }
    if isinstance(complete, str) and complete:
        result["verification_uri_complete"] = complete
    return result


def _poll_token(
    *,
    device_code: str,
    interval: int,
    expires_in: int,
    opener: Callable[..., Any],
    sleep: Callable[[float], None],
) -> TokenGrant:
    poll_interval = float(interval)
    deadline = time.monotonic() + float(expires_in)
    while True:
        sleep(poll_interval)
        if time.monotonic() >= deadline:
            raise AuthError("device code expired")
        status, data = _http_post_form(
            TOKEN_URL,
            {
                "grant_type": DEVICE_GRANT_TYPE,
                "device_code": device_code,
                "client_id": CLIENT_ID,
            },
            opener,
        )
        if status == 200:
            return _grant_from_token_payload(data)
        error = data.get("error") if isinstance(data, dict) else None
        if error == "authorization_pending":
            continue
        if error == "slow_down":
            poll_interval += SLOW_DOWN_INCREMENT_SECS
            continue
        if error == "access_denied":
            raise DeviceCodeDenied(_error_message(data, status, "authorization denied"))
        if error == "expired_token":
            raise AuthError("device code expired")
        raise AuthError(_error_message(data, status, "token poll failed"))


def _grant_from_token_payload(data: object) -> TokenGrant:
    if not isinstance(data, dict):
        raise AuthError("token response is not an object")
    access = data.get("access_token")
    if not isinstance(access, str) or not access:
        raise AuthError("token response missing access_token")
    refresh = data.get("refresh_token")
    if refresh is not None and not isinstance(refresh, str):
        raise AuthError("token response has invalid refresh_token")
    if refresh == "":
        refresh = None
    expires_raw = data.get("expires_in", DEFAULT_EXPIRES_IN_SECS)
    seconds = _as_int(expires_raw, "expires_in")
    if seconds < 0:
        raise AuthError("invalid expires_in")
    expires_at = datetime.now(UTC) + timedelta(seconds=seconds)
    id_token = data.get("id_token")
    claims = claims_from_jwt(id_token) if isinstance(id_token, str) else {}
    if not claims:
        claims = claims_from_jwt(access)
    sub = claims.get("sub")
    email = claims.get("email")
    subject = sub if isinstance(sub, str) else ""
    email_s = email if isinstance(email, str) else None
    return TokenGrant(access, refresh, expires_at, email_s, subject)


def _http_post_form(
    url: str,
    fields: dict[str, str],
    opener: Callable[..., Any],
    timeout: float = HTTP_TIMEOUT_SECS,
) -> tuple[int, Any]:
    body = urllib.parse.urlencode(fields).encode("ascii")
    request = urllib.request.Request(url, data=body, method="POST")
    request.add_header("Content-Type", "application/x-www-form-urlencoded")
    request.add_header("Accept", "application/json")
    request.add_header("User-Agent", f"rhc/{VERSION}")
    try:
        resp = opener(request, timeout=timeout)
    except urllib.error.HTTPError as e:
        try:
            raw = e.read()
        except OSError as read_err:
            raise AuthError(f"HTTP read failed: {url}") from read_err
        return e.code, _parse_json_body(raw, url, e.code)
    except urllib.error.URLError as e:
        raise AuthError(f"HTTP request failed: {url}") from e
    except TimeoutError as e:
        raise AuthError(f"HTTP request timed out: {url}") from e
    try:
        raw = resp.read()
        status = int(
            getattr(resp, "status", None)
            or getattr(resp, "code", None)
            or resp.getcode()
        )
    except OSError as e:
        raise AuthError(f"HTTP read failed: {url}") from e
    finally:
        close = getattr(resp, "close", None)
        if close is not None:
            close()
    return status, _parse_json_body(raw, url, status)


def _parse_json_body(raw: bytes, url: str, status: int) -> Any:
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as e:
        raise AuthError(f"non-UTF8 response from {url} (HTTP {status})") from e
    if not text.strip():
        return {}
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise AuthError(f"invalid JSON from {url} (HTTP {status})") from e


def _require_str(data: dict[str, Any], key: str) -> str:
    value = data.get(key)
    if not isinstance(value, str) or not value:
        raise AuthError(f"device code response missing {key}")
    return value


def _as_int(value: object, name: str) -> int:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise AuthError(f"invalid {name}")
    return int(value)


def _validate_verification_uri(uri: str) -> None:
    if any(ord(ch) < 32 for ch in uri):
        raise AuthError("invalid verification_uri")
    parsed = urllib.parse.urlparse(uri)
    host = (parsed.hostname or "").lower()
    if parsed.scheme == "https":
        return
    if parsed.scheme == "http" and host in {"localhost", "127.0.0.1"}:
        return
    raise AuthError("unsupported verification_uri scheme")


def _error_message(data: object, status: int, fallback: str) -> str:
    if isinstance(data, dict):
        detail = data.get("error_description") or data.get("error")
        if isinstance(detail, str) and detail:
            return detail
    return f"{fallback} (HTTP {status})"

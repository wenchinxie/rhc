from __future__ import annotations

import json
from pathlib import Path

from xai_oauth.client import AuthClient
from xai_oauth.constants import GROK_SCOPE_KEY
from xai_oauth.session import OAuthSession


def test_from_grok_copies_key_not_refresh(tmp_path: Path) -> None:
    grok_path = tmp_path / "grok-auth.json"
    grok_path.write_text(
        json.dumps(
            {
                GROK_SCOPE_KEY: {
                    "key": "grok-access",
                    "auth_mode": "oidc",
                    "user_id": "user-9",
                    "email": "g@x.ai",
                    "expires_at": "2030-01-01T00:00:00Z",
                    "refresh_token": "grok-refresh-must-not-copy",
                    "oidc_issuer": "https://auth.x.ai",
                    "oidc_client_id": "b1a00492-073a-47ea-816f-4c329264a828",
                }
            }
        ),
        encoding="utf-8",
    )
    rhc_path = tmp_path / "auth.json"
    client = AuthClient(rhc_path, grok_path=grok_path)
    session = client.login(from_grok=True)
    assert isinstance(session, OAuthSession)
    assert session.access_token == "grok-access"
    assert session.refresh_token is None
    assert session.email == "g@x.ai"
    assert session.subject == "user-9"
    loaded = client.load()
    assert isinstance(loaded, OAuthSession)
    assert loaded.refresh_token is None
    assert grok_path.read_text(encoding="utf-8").find("grok-refresh-must-not-copy") != -1

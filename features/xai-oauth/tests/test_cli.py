from __future__ import annotations

import json
from pathlib import Path

import pytest

from xai_oauth.__main__ import main
from xai_oauth.constants import GROK_SCOPE_KEY


def test_whoami_logged_out(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    monkeypatch.setenv("HOME", str(tmp_path))
    assert main(["whoami"]) == 0
    out = capsys.readouterr().out
    assert "logged out" in out.lower()


def test_logout_twice_cli(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("HOME", str(tmp_path))
    assert main(["logout"]) == 0
    assert main(["logout"]) == 0
    assert main(["whoami"]) == 0


def test_login_from_grok_cli(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    monkeypatch.setenv("HOME", str(tmp_path))
    grok_dir = tmp_path / ".grok"
    grok_dir.mkdir()
    (grok_dir / "auth.json").write_text(
        json.dumps(
            {
                GROK_SCOPE_KEY: {
                    "key": "imported-access",
                    "user_id": "user-cli",
                    "email": "cli@x.ai",
                    "expires_at": "2030-01-01T00:00:00Z",
                    "refresh_token": "must-not-copy",
                }
            }
        ),
        encoding="utf-8",
    )
    assert main(["login", "--from-grok"]) == 0
    login_out = capsys.readouterr().out
    assert "cli@x.ai" in login_out
    assert "must-not-copy" not in login_out
    assert main(["whoami"]) == 0
    who = capsys.readouterr().out
    assert "user-cli" in who
    assert "cli@x.ai" in who
    assert "imported-access" not in who
    rhc_auth = (tmp_path / ".rhc" / "auth.json").read_text(encoding="utf-8")
    stored = json.loads(rhc_auth)
    assert stored["credential"]["access_token"] == "imported-access"
    assert stored["credential"]["refresh_token"] is None

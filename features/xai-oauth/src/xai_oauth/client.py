from __future__ import annotations

import sys
import time
import urllib.request
from collections.abc import Callable
from pathlib import Path
from typing import Any, TextIO

from xai_oauth.grok_import import import_oauth_from_grok
from xai_oauth.oidc import run_device_code_flow
from xai_oauth.session import OAuthSession, Session
from xai_oauth.store import TokenStore


class AuthClient:
    def __init__(
        self,
        path: Path | None = None,
        *,
        opener: Callable[..., Any] | None = None,
        sleep: Callable[[float], None] | None = None,
        stderr: TextIO | None = None,
        grok_path: Path | None = None,
    ) -> None:
        self._opener = opener if opener is not None else urllib.request.urlopen
        self._sleep = sleep if sleep is not None else time.sleep
        self._stderr = stderr if stderr is not None else sys.stderr
        self._grok_path = grok_path
        self._store = TokenStore(path, opener=self._opener, sleep=self._sleep)

    def load(self) -> Session:
        return self._store.load()

    def login(self, *, from_grok: bool = False) -> OAuthSession:
        if from_grok:
            session = import_oauth_from_grok(self._grok_path)
        else:
            session = run_device_code_flow(
                opener=self._opener,
                sleep=self._sleep,
                stderr=self._stderr,
            )
        session = session.bind(self._store, self._opener, self._sleep)
        with self._store.lock():
            self._store.save(session)
        return session

    def logout(self) -> None:
        with self._store.lock():
            self._store.clear()

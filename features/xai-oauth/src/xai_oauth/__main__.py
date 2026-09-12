from __future__ import annotations

import argparse
import sys

from xai_oauth.client import AuthClient
from xai_oauth.session import AuthError, LoggedOut, OAuthSession


def main(argv: list[str] | None = None) -> int:
    parser = _parser()
    args = parser.parse_args(argv)
    client = AuthClient()
    try:
        return _dispatch(args, client)
    except AuthError as e:
        print(e, file=sys.stderr)
        return 1


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="rhc")
    sub = parser.add_subparsers(dest="cmd", required=True)
    login = sub.add_parser("login", help="sign in with xAI device-code OAuth")
    login.add_argument(
        "--from-grok",
        action="store_true",
        help="copy the Grok Build access token (not the refresh token)",
    )
    sub.add_parser("logout", help="clear the local rhc session")
    sub.add_parser("whoami", help="print the signed-in identity")
    return parser


def _dispatch(args: argparse.Namespace, client: AuthClient) -> int:
    if args.cmd == "login":
        session = client.login(from_grok=args.from_grok)
        ident = session.identity()
        print(f"signed in as {ident.email or ident.subject}")
        return 0
    if args.cmd == "logout":
        client.logout()
        return 0
    if args.cmd == "whoami":
        return _whoami(client)
    raise AuthError(f"unknown command: {args.cmd}")


def _whoami(client: AuthClient) -> int:
    session = client.load()
    if isinstance(session, LoggedOut):
        print("logged out")
        return 0
    if isinstance(session, OAuthSession):
        ident = session.identity()
        print(f"subject: {ident.subject}")
        if ident.email:
            print(f"email: {ident.email}")
        print(f"issuer: {ident.issuer}")
        return 0
    raise AuthError("unknown session kind")


if __name__ == "__main__":
    raise SystemExit(main())

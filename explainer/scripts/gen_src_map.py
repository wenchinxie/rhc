"""Write a harness src-map.json from snips.json by reading the real source.

Each snip names a file, an anchor line, and a line count. The anchor is a
substring of the first line, so the snippet follows the code when lines move.
Other repos come from GROK_BUILD_SRC, HERMES_SRC and PI_SRC. A snip whose
root is unset or missing keeps its previous entry.

    GROK_BUILD_SRC=... python3 scripts/gen_src_map.py src/harnesses/rhc-oauth
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
ROOT_ENV = {"grok-build": "GROK_BUILD_SRC", "hermes": "HERMES_SRC", "pi": "PI_SRC"}


def root_of(name: str) -> Path | None:
    if name == "rhc":
        return REPO
    value = os.environ.get(ROOT_ENV[name])
    return Path(value) if value else None


def snip(spec: dict) -> dict | None:
    root = root_of(spec.get("root", "rhc"))
    if root is None or not (root / spec["path"]).exists():
        return None
    path = root / spec["path"]
    lines = path.read_text().splitlines()
    anchor = spec["anchor"]
    hits = [i for i, line in enumerate(lines) if anchor in line]
    if len(hits) != 1:
        raise SystemExit(f"{spec['key']}: anchor {anchor!r} matched {len(hits)} lines in {path}")
    first = hits[0]
    body = lines[first : first + spec["count"]]
    start = first + 1
    end = start + len(body) - 1
    hi = []
    for mark in spec.get("hi", []):
        found = [start + i for i, line in enumerate(body) if mark in line]
        if not found:
            raise SystemExit(f"{spec['key']}: hi {mark!r} not in snippet")
        hi.append(found[0])
    prefix = "" if spec.get("root", "rhc") == "rhc" else f"{spec['root']}: "
    return {
        "type": "code",
        "kind": "code",
        "title": spec["title"],
        "meta": f"{prefix}{spec['path']}:{start}-{end}",
        "why": spec["why"],
        "start": start,
        "hi": hi,
        "lines": body,
    }


def main() -> None:
    folder = Path(sys.argv[1])
    specs = json.loads((folder / "snips.json").read_text())
    out_path = folder / "src-map.json"
    previous = json.loads(out_path.read_text()) if out_path.exists() else {}
    out = {}
    for spec in specs:
        entry = snip(spec)
        if entry is None:
            if spec["key"] not in previous:
                raise SystemExit(f"{spec['key']}: source missing and no previous entry")
            entry = previous[spec["key"]]
        out[spec["key"]] = entry
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
    print("wrote", out_path, len(out))


if __name__ == "__main__":
    main()

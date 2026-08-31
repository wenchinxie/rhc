#!/usr/bin/env python3
"""Merge whisper fragments into quote-sized English paragraphs."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src" / "harnesses" / "grok-bot"
CATS = [
    ("s7-0", "t-0"),
    ("s7-1", "t-1233"),
    ("s7-2", "t-3235"),
    ("s7-3", "t-5778"),
    ("s7-4", "t-11335"),
    ("s7-5", "t-15538"),
    ("s7-6", "t-26569"),
    ("s7-7", "t-31202"),
]
GAP = 0.8
MAX = 520


def main() -> None:
    d = json.loads((ROOT / "lauren-talk.slim.json").read_text(encoding="utf-8"))
    segs = d["segments"]
    id_start = {s["id"]: s["start"] for s in segs}
    bounds = []
    for i, (cid, first) in enumerate(CATS):
        lo = id_start[first]
        hi = id_start[CATS[i + 1][1]] if i + 1 < len(CATS) else 1e9
        bounds.append((cid, lo, hi))

    out: list[dict] = []
    for cid, lo, hi in bounds:
        sl = [s for s in segs if lo <= s["start"] < hi]
        paras: list[dict] = []
        cur: list[dict] = []

        def flush() -> None:
            if not cur:
                return
            text = " ".join(s["text"].strip() for s in cur)
            text = re.sub(r"\s+", " ", text).strip()
            paras.append(
                {
                    "id": cur[0]["id"],
                    "t": cur[0]["t"],
                    "start": cur[0]["start"],
                    "end": cur[-1]["end"],
                    "en": text,
                    "nSeg": len(cur),
                    "block": cid,
                }
            )
            cur.clear()

        for s in sl:
            if not cur:
                cur.append(s)
                continue
            gap = s["start"] - cur[-1]["end"]
            so_far = sum(len(x["text"]) + 1 for x in cur)
            prev = cur[-1]["text"].rstrip()
            start_new = gap >= GAP or (
                so_far >= MAX and prev.endswith((".", "?", "!"))
            )
            if start_new:
                flush()
                cur.append(s)
            else:
                cur.append(s)
        flush()
        print(
            cid,
            "paras",
            len(paras),
            "chars",
            sum(len(p["en"]) for p in paras),
            "max",
            max(len(p["en"]) for p in paras),
        )
        out.extend(paras)

    payload = {
        "model": d.get("model"),
        "nSeg": d.get("n"),
        "nFix": d.get("nFix"),
        "nQuote": len(out),
        "quotes": out,
    }
    dest = ROOT / "lauren-talk.combined.en.json"
    dest.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print("TOTAL", len(out), "chars", sum(len(p["en"]) for p in out), "->", dest)


if __name__ == "__main__":
    main()

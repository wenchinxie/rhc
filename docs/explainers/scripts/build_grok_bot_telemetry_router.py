#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""telemetry router decision tree for grok-bot.

Classifies telemetry events into 7 kinds by adapter pattern.
"""
from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

# Match import shim from sibling script.
SKILL_SCRIPTS = Path(
    os.environ.get("DESIGN_EXPLAINER_SCRIPTS")
    or str(Path.home() / ".claude/skills/design-explainer/scripts")
)
sys.path.insert(0, str(SKILL_SCRIPTS))
import tree_grammar as tg  # noqa: E402

HERE = Path(__file__).resolve().parent.parent / "src/harnesses/grok-bot"

# Update additive lane keys.
tg.LANES.update({
    "emit": "發生", "port": "port", "adapter": "轉接", "pipe": "管線", "sink": "落地",
})

# Ordered classification rules: regex on adapter -> kind
RULES = [
    (re.compile(r"host/extensions/telemetry/structured-log-telemetry"), "host-turn"),
    (re.compile(r"electron-main/telemetry/sentry\.ts"), "sentry-direct"),
    (re.compile(r"host-telemetry-service\.ts"), "analytics-direct"),
    (re.compile(r"transport-stage-recorder"), "transport-stage"),
    (re.compile(r"electron-main/coordinator/coordinator-telemetry"), "coordinator-agg"),
    (re.compile(r"electron-main/adapters/telemetry\.ts"), "desktop-log"),
]


def classify(adapter: str) -> str:
    # First matching regex wins, else feature-buffered
    for pattern, kind in RULES:
        if pattern.search(adapter):
            return kind
    return "feature-buffered"


def main() -> None:
    events_file = HERE / "events.json"
    with open(events_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    events = data.get("events", [])
    total_events = len(events)
    counts: dict[str, int] = {
        "host-turn": 0,
        "sentry-direct": 0,
        "analytics-direct": 0,
        "transport-stage": 0,
        "coordinator-agg": 0,
        "desktop-log": 0,
        "feature-buffered": 0,
    }

    mismatches = []
    for ev in events:
        adapter = ev.get("adapter", "")
        derived = classify(adapter)
        declared = ev.get("family", "")
        if derived != declared:
            mismatches.append(f"MISMATCH {ev.get('event')} derived={derived} declared={declared}")
        counts[derived] += 1

    if mismatches:
        for m in mismatches:
            print(m)
        sys.exit(1)

    t = tg.Tree()
    t.set_lane("emit")
    t.sbox("一筆遙測事件產生", f"呼叫圖裡 {total_events} 個打進 port 方法的呼叫點", h=64, snip="t-events")
    t.drop()
    t.set_lane("adapter")

    # Diamond 1: host-turn
    q1 = "接 host 結構化日誌 adapter？"
    _, cy1 = t.diamond(q1)
    exit1 = (
        f"host-turn：{counts['host-turn']} 筆",
        "SandTelemetry port，緩衝滿 1000 筆砍心跳，送失敗留底重試",
        False,
        None,
        "t8-adapter-host",
    )
    t.outs(cy1, [exit1], no_label=None)
    t.drop("否")

    # Diamond 2: sentry-direct
    q2 = "@sentry/electron 直接 capture？"
    _, cy2 = t.diamond(q2)
    exit2 = (
        f"sentry-direct：{counts['sentry-direct']} 筆",
        "有 port 與 no-op 預設，沒有佇列，送不出就跳過",
        False,
        None,
        "t-sentry",
    )
    t.outs(cy2, [exit2], no_label=None)
    t.drop("否")

    # Diamond 3: analytics-direct
    q3 = "打進產品分析 trackEvent？"
    _, cy3 = t.diamond(q3)
    exit3 = (
        f"analytics-direct：{counts['analytics-direct']} 筆",
        "ProductAnalytics port，gate 沒開整包丟棄",
        False,
        None,
        "t8-adapter-host",
    )
    t.outs(cy3, [exit3], no_label=None)
    t.drop("否")

    # Diamond 4: transport-stage
    q4 = "送出追蹤的階段記錄器接手？"
    _, cy4 = t.diamond(q4)
    exit4 = (
        f"transport-stage：{counts['transport-stage']} 筆",
        "TransportStageEgress → recordSendStage，滿了直接放棄",
        False,
        None,
        "t-transport-cap",
    )
    t.outs(cy4, [exit4], no_label=None)
    t.drop("否")

    # Diamond 5: coordinator-agg
    q5 = "先過中介行程的翻譯層再進上傳器？"
    _, cy5 = t.diamond(q5)
    exit5 = (
        f"中介行程聚合：{counts['coordinator-agg']} 筆",
        "翻譯層不是 adapter，併上斷線原因後交同一份上傳器",
        False,
        None,
        "t-coordinator-agg",
    )
    t.outs(cy5, [exit5], no_label=None)
    t.drop("否")

    # Diamond 6: desktop-log
    q6 = "桌面主行程的正式 adapter 接手？"
    _, cy6 = t.diamond(q6)
    exit6 = (
        f"desktop-log：{counts['desktop-log']} 筆",
        "TelemetryUploader port → 驗證 → 緩衝佇列 → flushOnce",
        False,
        None,
        "t8-pipes-full",
    )
    t.outs(cy6, [exit6], no_label=None)
    t.drop("否")

    # Final spine box
    t.set_lane("sink")
    t.sbox(
        f"feature-buffered：{counts['feature-buffered']} 筆",
        "模組自帶 reporter，sink 未接前暫存 64 筆，滿了丟棄",
        h=64,
        snip="t8-lifecycle-wire",
    )

    caption = "七十筆事件靠 adapter 欄位分成七種；每個出口寫這一種的 port、管線與落地，細節見各家族小節。"
    svg = t.render(did="s8-router", label="telemetry 事件種類判別樹", caption=caption)

    (HERE / "telemetry-router.svg").write_text(svg, encoding="utf-8")

    ts_content = f"export const ROUTER: string = `\n{svg.replace(chr(96), chr(92) + chr(96))}`;\n"
    (HERE / "telemetryRouter.ts").write_text(ts_content, encoding="utf-8")

    print(f"classified {total_events}/{total_events}")


if __name__ == "__main__":
    main()

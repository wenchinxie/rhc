#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""telemetry pipeline shared shape tree for grok-bot."""
from __future__ import annotations

import os
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

CAPTION = "三條管線都是同一個形狀：呼叫端只認 port，port 有 no-op 預設所以關遙測不改呼叫端，adapter 在開機接線時驗證，差別只在中間那層和落地。"


def main() -> None:
    t = tg.Tree()
    t.set_lane("emit")
    t.sbox("功能模組呼叫一支具名方法", "例如 turn-runtime 叫 startTurn；只認方法名不知去向", h=64, snip="t-events")
    t.drop()
    t.set_lane("port")
    _, cy = t.diamond("遙測開關關著？")
    t.outs(cy, [("no-op 預設塞子", "host 用 createNoopSandTelemetry 空實作；桌面缺席用 ?. 跳過", True, None, "t-noop")], no_label=None)
    t.drop("開著")
    t.sbox("port：型別與方法名的清單", "host 在 ports/telemetry.ts；桌面版沒有 export", h=64, snip="t-noop")
    t.drop()
    t.set_lane("adapter")
    _, cy = t.diamond("開機接線時 port 缺欄位？")
    t.outs(cy, [("當場丟 TypeError", "Missing Electron production adapter port，不等第一筆事件", False, None, "t-adapter")], no_label=None)
    t.drop("齊全")
    t.sbox("adapter：工廠把 port 接上真後端", "createProductionTelemetryAdapter 等工廠函式", h=64, snip="t8-adapter-host")
    t.drop()
    t.set_lane("pipe")
    _, cy = t.diamond("中間有翻譯、緩衝或聚合層？")
    t.outs(cy, [("翻譯、緩衝或聚合", "有的管線有，有的直送；各管線小節只講這一段的差別", False)], no_label=None)
    t.drop("直送")
    t.set_lane("sink")
    t.sbox("落地", "HTTP、佇列與 Sentry，外加 span 和產品分析旁路", h=64)
    svg = t.render(did="s8-shape", label="telemetry 管線共同形狀", caption=CAPTION)

    (HERE / "telemetry-shape.svg").write_text(svg, encoding="utf-8")

    ts_content = f"export const SHAPE: string = `\n{svg.replace(chr(96), chr(92) + chr(96))}`;\n"
    (HERE / "telemetryShape.ts").write_text(ts_content, encoding="utf-8")
    print("built telemetry-shape.svg and telemetryShape.ts")


if __name__ == "__main__":
    main()

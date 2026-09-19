#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Grok Bot 0.47 product decision tree (tree_grammar).

Ladder of gates that change where work runs. Spine is the factory path.
Each diamond has one hang-right exit. Generator only; geometry is the module.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

SKILL_SCRIPTS = Path(
    os.environ.get("DESIGN_EXPLAINER_SCRIPTS")
    or str(Path.home() / ".claude/skills/design-explainer/scripts")
)
sys.path.insert(0, str(SKILL_SCRIPTS))
import tree_grammar as tg  # noqa: E402

HERE = Path(__file__).resolve().parent.parent / "src/harnesses/grok-bot"


def build() -> tg.Tree:
    t = tg.Tree(mk="dt")
    t.set_lane("ui")
    t.sbox("使用者送出一則訊息", "畫面經 MessagePort 進中介", h=64, sec="s3", snip="s3-nonce")
    t.drop()
    t.set_lane("desk")
    _, cy = t.diamond("已設 gateway URL？", sec="s6")
    t.outs(
        cy,
        [("直連該 URL", "跳過 EnsureSandBox", False, "s6")],
        no_label="已設",
    )
    t.drop("未設")
    t.sbox("EnsureSandBox 要一台 box", "空 gatewayUrl 就失敗", h=64, sec="s6", snip="remote-box")
    t.drop()
    t.set_lane("admit")
    t.sbox("host 接受這則送出", "回 accepted，不是答完", h=64, sec="s3", snip="s3-accepted")
    t.drop()
    t.set_lane("tools")
    _, cy2 = t.diamond("指令帶 machineId？", sec="s5")
    t.outs(
        cy2,
        [("本機 local-exec", "使用者磁碟上的 daemon", False, "s6", "local-exec-spawn")],
        no_label="帶了",
    )
    t.drop("沒有")
    t.sbox("box 裡 spawn 指令", "daemon 聽 1337", h=64, sec="s5", snip="box-exec")
    t.drop()
    t.set_lane("exec")
    _, cy3 = t.diamond("設了 mock 回覆？", sec="s4")
    t.outs(
        cy3,
        [("不打網路", "SAND_AGENT_MOCK_RESPONSE", True, "s4")],
        no_label="設了",
    )
    t.drop("沒有")
    t.sbox("Cursor Stream 問模型", "api2.cursor.sh，短票在記憶體", h=64, sec="s4", snip="s4-stream")
    return t


def main() -> None:
    t = build()
    caption = (
        "主幹是出廠路徑。菱形往右是例外。"
        "未設 gateway URL 才問後端要 box。"
        "指令沒帶 machineId 才在 box 裡跑。"
        "沒設 mock 才打 Cursor Stream。"
    )
    svg = t.render(
        did="how-decide",
        label="一則送出之後誰決定工作跑在哪",
        caption=caption,
    )
    (HERE / "decision-tree.svg").write_text(svg, encoding="utf-8")
    ts = "export const DECISION_TREE: string = `\n" + svg.replace("`", "\\`") + "`;\n"
    (HERE / "decisionTree.ts").write_text(ts, encoding="utf-8")
    print("wrote", HERE / "decision-tree.svg")
    print("wrote", HERE / "decisionTree.ts")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""§0 run tree for grok-bot. Geometry from design-explainer tree_grammar only."""
from __future__ import annotations

import re
import sys
from pathlib import Path

SKILL_SCRIPTS = Path("/home/hanson/.grok/skills/design-explainer/scripts")
sys.path.insert(0, str(SKILL_SCRIPTS))
from tree_grammar import Tree  # noqa: E402

HERE = Path(__file__).resolve().parent.parent / "src/harnesses/grok-bot"


def main() -> None:
    t = Tree()
    t.set_lane("ui")
    t.sbox(
        "畫面開窗並交出送出",
        "renderer 與 preload",
        kind="kern",
        sec="s2",
        snip="e-main",
    )
    t.drop()
    t.set_lane("desk")
    _, cy = t.diamond("模型來源是 cursor？", sec="s3", snip="router-cursor")
    t.outs(
        cy,
        [
            (
                "否：控制面改走別家模型",
                "Claude Code／Codex／OpenRouter",
                False,
                "s6",
                "router-cursor",
            )
        ],
        no_label="",
    )
    t.drop("是：放手給 host")
    t.set_lane("box")
    t.sbox(
        "接到一台隔離機器",
        "出廠 ensureSandBox，可改本機 Docker",
        kind="kern",
        sec="s5",
        snip="remote-box",
    )
    t.drop()
    t.set_lane("admit")
    t.sbox(
        "去重並接受這一則送出",
        "SendPipeline sendPrompt",
        kind="kern",
        sec="s3",
        snip="send-prompt",
    )
    t.drop()
    t.set_lane("loop")
    _, model_cy = t.sbox(
        "問模型一步，字一出就回畫面",
        "runTurnLoop sendUpdate，上限 5000",
        kind="kern",
        sec="s3",
        snip="max-steps",
    )
    t.drop()
    _, after_cy = t.diamond("模型這步之後呢？", sec="s3", snip="max-steps")
    t.outs(
        after_cy,
        [
            (
                "結束：最終結果留在畫面",
                "沒工具、沒新送出、沒提問",
                False,
                "s3",
                "preload-port",
            ),
            (
                "人：畫面出問句或收新送出",
                "ask、權限、排隊、插話",
                False,
                "s3",
                "preload-port",
            ),
        ],
        no_label="",
    )
    t.drop("工具")
    t.set_lane("tools")
    t.sbox(
        "掛上模型可呼叫的工具",
        "toolsGenerator 與 MCP",
        kind="app",
        sec="s4",
    )
    t.drop()
    t.set_lane("exec")
    _, cy = t.diamond("這步在使用者電腦跑？", sec="s4", snip="perm")
    t.outs(
        cy,
        [
            (
                "是：本機命令服務",
                "權限預設先問再跑",
                False,
                "s4",
                "perm",
            )
        ],
        no_label="",
    )
    t.drop("否：遠端代跑")
    _, wb_cy = t.sbox(
        "工具結果寫回這一回合",
        "applyPostStepProcessing",
        kind="kern",
        sec="s3",
        snip="max-steps",
    )
    t.loop_teal(wb_cy, model_cy)
    frag = t.render(
        "map",
        "Grok Bot：七塊職責總覽",
        caption=None,
    )
    m = re.search(r"(<svg class=\"dag\"[\s\S]*?</svg>)", frag)
    if not m:
        raise SystemExit("tree render did not emit svg")
    svg = m.group(1) + "\n"
    (HERE / "dag.svg").write_text(svg, encoding="utf-8")
    (HERE / "dagMarkup.ts").write_text(
        "export const DAG_SVG = `\n" + svg.replace("`", "\\`") + "`;\n",
        encoding="utf-8",
    )
    print("vbh", re.search(r'viewBox="0 0 920 ([0-9.]+)"', svg).group(1))
    print("wrote", HERE / "dag.svg")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""§3 send/turn tree: same tree_grammar as §0, MECE lanes, loop expanded."""
from __future__ import annotations

import re
import sys
from pathlib import Path

SKILL_SCRIPTS = Path("/home/hanson/.grok/skills/design-explainer/scripts")
sys.path.insert(0, str(SKILL_SCRIPTS))
from tree_grammar import Tree  # noqa: E402

HERE = Path(__file__).resolve().parent.parent / "src/harnesses/grok-bot"


def main() -> None:
    t = Tree(mk="scip")
    t.set_lane("ui")
    t.sbox(
        "畫面交出這一則送出",
        "MessagePort sendPrompt",
        kind="kern",
        sec="s3",
        snip="preload-port",
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
    t.set_lane("admit")
    t.sbox(
        "去重並接受這一則",
        "sendPrompt",
        kind="kern",
        sec="s3",
        snip="send-prompt",
    )
    t.drop()
    t.sbox(
        "寫使用者那行、派出回合",
        "sendPromptOnce",
        kind="kern",
        sec="s3",
        snip="send-prompt",
    )
    t.drop()
    t.sbox(
        "中斷舊跑、排隊新跑",
        "dispatchUserTurn",
        kind="kern",
        sec="s3",
        snip="send-prompt",
    )
    t.drop("經 enqueueExclusiveRun 閉包")
    t.set_lane("loop")
    t.sbox(
        "開這一回合",
        "runTurn → runner.run",
        kind="kern",
        sec="s3",
        snip="max-steps",
    )
    t.drop()
    t.sbox(
        "初始化對話後進迴圈",
        "handle",
        kind="kern",
        sec="s3",
        snip="max-steps",
    )
    t.drop()
    _, model_cy = t.sbox(
        "問模型並收集工具呼叫",
        "executeStepWithMetrics → runStep",
        kind="kern",
        sec="s3",
        snip="max-steps",
    )
    t.drop()
    _, more_cy = t.diamond("未滿 5000 且還要再跑？", sec="s3", snip="max-steps")
    t.outs(
        more_cy,
        [
            (
                "否：回合結束",
                "沒工具也沒排隊，或已踩上限",
                False,
                "s3",
                "preload-port",
            )
        ],
        no_label="",
    )
    t.drop("是：消化排隊再跑工具")
    t.sbox(
        "消化排隊、必要時催下一步",
        "consumeQueuedUserMessages",
        kind="app",
        sec="s3",
        snip="max-steps",
    )
    t.drop()
    t.set_lane("exec")
    _, loc_cy = t.diamond("這步工具在使用者電腦跑？", sec="s4", snip="perm")
    t.outs(
        loc_cy,
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
    frag = t.render("scip-send", "一則送出：接納、迴圈、執行")
    m = re.search(r"(<svg class=\"dag\"[\s\S]*?</svg>)", frag)
    if not m:
        raise SystemExit("tree render did not emit svg")
    svg = m.group(1) + "\n"
    (HERE / "scip.svg").write_text(svg, encoding="utf-8")
    (HERE / "scipMarkup.ts").write_text(
        "export const SCIP_SVG = `\n" + svg.replace("`", "\\`") + "`;\n",
        encoding="utf-8",
    )
    print("vbh", re.search(r'viewBox="0 0 920 ([0-9.]+)"', svg).group(1))
    print("wrote", HERE / "scip.svg")


if __name__ == "__main__":
    main()

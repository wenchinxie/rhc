#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""§8 telemetry trees for grok-bot: one tree_grammar tree per event family.

Replaces build_grok_bot_telemetry_dag.py's single 3-box fan-out DAG: that
shape can show one split, not seven families each with their own drop
policy. Import path for tree_grammar is env-overridable so this script has
no hardcoded foreign path (only the default points at the design-explainer
skill, per the skill's own convention).
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

# Additive lane keys for this document's five pipeline stages (spec: never
# rename an existing key). "port" (not CJK) still passes the width assert.
tg.LANES.update({
    "emit": "發生", "port": "port", "adapter": "轉接", "pipe": "管線", "sink": "落地",
})


def host_turn() -> tuple[tg.Tree, str]:
    t = tg.Tree()
    t.set_lane("emit")
    t.sbox("turn 生命週期事件", "共七類", h=64)
    t.drop()
    t.sbox("tool-call 追蹤事件", "共三類", h=64)
    t.drop()
    t.sbox("訊息與佇列事件", "共九類", h=64)
    t.drop()
    t.sbox("復活與收尾事件", "共三類", h=64)
    t.drop()
    t.sbox("自動化事件", "共三類", h=64)
    t.drop()
    t.sbox("沙箱 daemon ping 事件", "共一類", h=64, snip="t-noop")
    t.drop()
    t.set_lane("port")
    t.sbox("SandTelemetry port", "31 支具名方法，5 支無人呼叫", snip="t-noop")
    t.drop()
    t.set_lane("adapter")
    t.sbox("SandStructuredLogTelemetry", "host 行程自己的 adapter，跟桌面那支不同檔",
           snip="t8-adapter-host")
    t.drop()
    t.set_lane("pipe")
    _, cy = t.diamond("緩衝區超過 1000 筆？", snip="t8-buffer-const")
    t.outs(cy, [("砍最舊的 host／box 心跳日誌", "overflow_evicted，不動其餘訊息",
                 False, None, "t8-overflow-host")], no_label=None)
    t.drop("未超過")
    t.set_lane("sink")
    t.sbox("StructuredLogTransport 送出", "HTTP submitLogs 到 Cursor 後端", h=64)
    _, cy2 = t.diamond("這次送出失敗？")
    t.outs(cy2, [("留底重試", "buffer 原封不動，下一輪同一批再送", False)], no_label=None)
    t.drop("成功")
    return t, "host 行程 26 類執行期事件共用同一份 SandTelemetry port 與同一支 adapter；緩衝上限 1000 筆，滿了先砍心跳日誌，送出失敗留底重試。"


def desktop_log() -> tuple[tg.Tree, str]:
    t = tg.Tree()
    t.set_lane("emit")
    t.sbox("送達與延遲事件", "send-latency／send-ack／reaction-ack／render 等五類",
           h=64, snip="t-send-ack")
    t.drop()
    t.sbox("代理人載入與擋阻事件", "agent-load／access-blocked／client-failure 三類",
           h=64, snip="t-agent-load")
    t.drop()
    t.sbox("視訊與電腦操作事件", "vnc-session／vnc-liveness／open-computer 三類",
           h=64, snip="t8-pipes-full")
    t.drop()
    t.sbox("更新提示與登入閘事件", "update-prompt／signin-gate 兩類", h=64)
    t.drop()
    t.set_lane("port")
    t.sbox("TelemetryUploader port", "13 支報告管子共用同一份介面",
           snip="t8-pipes-full")
    t.drop()
    t.set_lane("adapter")
    t.sbox("createProductionTelemetryAdapter", "組出 SandDesktopStructuredLogTelemetry",
           snip="t-adapter")
    t.drop()
    t.set_lane("pipe")
    _, cy = t.diamond("isValid 驗證通過？", snip="t-pipe")
    t.outs(cy, [("整包丟棄", "沒有中間佇列，當場結束", False)], no_label=None)
    t.drop("通過")
    _, cy2 = t.diamond("緩衝傳輸佇列滿了？")
    t.outs(cy2, [("砍最舊那幾筆", "overflow_evicted", False, None, "t-overflow")], no_label=None)
    t.drop("未滿")
    t.set_lane("sink")
    t.sbox("flushOnce() 送出", "送不出留底重試，斷線整批 spill 落地", h=64, snip="t-flush-fail")
    return t, "renderer／preload 經 IPC 交十三支報告管子，驗證沒過當場丟棄；驗證通過的走緩衝傳輸佇列，滿了砍最舊，斷線整批 spill 到本機檔案再續傳。"


def coordinator_agg() -> tuple[tg.Tree, str]:
    t = tg.Tree()
    t.set_lane("emit")
    t.sbox("沙箱可達性事件", "reachability／dns／stream／lifecycle 四類", h=64)
    t.drop()
    t.sbox("復原與遷移事件", "recovery／migration／rebuild／resync 五類",
           h=64, snip="t-reconciliation")
    t.drop()
    t.sbox("代理人不可達事件", "agents-unreachable 一類", h=64)
    t.drop()
    t.sbox("交接四階段事件", "requested／adopted／invoke_failed／timeout", h=64,
           snip="t-handoff")
    t.drop()
    t.set_lane("port")
    t.sbox("中介行程遙測聚合 port", "把十個以上的方法收進同一份介面", h=64)
    t.drop()
    t.set_lane("adapter")
    t.sbox("交接 telemetry 掛在中介行程接線層", "接的接線點是 production-provider",
           snip="t8-handoff-wire")
    t.drop()
    t.set_lane("pipe")
    _, cy = t.diamond("三十秒內有沒有最近一次失敗？")
    t.outs(cy, [("併上 disconnectCause", "使用者關閉／離線／host 重建／未知，四選一", False)], no_label=None)
    t.drop("沒有，維持原樣")
    t.set_lane("sink")
    t.sbox("同一份 getUploader() 上傳器", "轉送後落地成結構化日誌，不是另一個終點", h=64)
    return t, "十四類事件先在中介行程這層聚合（併上斷線原因或升級成警告），再轉送回 desktop-log 家族的同一份上傳器，不是另一條獨立的落地路徑。"


def transport_stage() -> tuple[tg.Tree, str]:
    t = tg.Tree()
    t.set_lane("emit")
    t.sbox("送出追蹤三階段事件", "開始送出／閘道回應／SSE 回聲", h=64, snip="t-transport-cap")
    t.drop()
    t.set_lane("port")
    t.sbox("TransportStageEgress port", "createTransportStageRecorder 收的介面", snip="t-transport-cap")
    t.drop()
    t.set_lane("adapter")
    t.sbox("轉發行程自己就是 adapter", "同一支檔案兼記錄與轉送", h=64)
    t.drop()
    t.set_lane("pipe")
    _, cy = t.diamond("同時在途超過 64 筆？", snip="t-transport-cap")
    t.outs(cy, [("這筆直接放棄", "連 dispatch 都不呼叫，不進佇列不計數", True)], no_label=None)
    t.drop("未超過")
    t.set_lane("sink")
    t.sbox("轉發執行器 reportTransportStage", "落地成送出追蹤 span，不是結構化日誌",
           h=64, snip="t8-transport-forward")
    return t, "轉發中的送出階段報告同時在途上限 64 筆，超過的新報告直接放棄；落地終點是一段追蹤 span，跟其餘家族落地成結構化日誌是不同的終點。"


def feature_buffered() -> tuple[tg.Tree, str]:
    t = tg.Tree()
    t.set_lane("emit")
    t.sbox("box 視窗開關事件", "setup／recreate 兩類", h=64, snip="t-box-visibility")
    t.drop()
    t.sbox("更新流程事件", "outcome／check／apply 三類", h=64, snip="t-update")
    t.drop()
    t.sbox("本機執行與連接器事件", "local-exec 安裝／connector 標籤 兩類", h=64,
           snip="t-local-exec")
    t.drop()
    t.sbox("乾淨退出結算事件", "unclean-exit 一類", h=64, snip="t-unclean-exit")
    t.drop()
    t.set_lane("adapter")
    t.sbox("各功能模組自帶接線", "三個模組各自一支，不共用一份介面",
           snip="t8-lifecycle-wire")
    t.drop()
    t.set_lane("pipe")
    _, cy = t.diamond("這支模組自己的緩衝條件成立？")
    t.outs(cy, [
        ("box：視窗還開著就不送", "真正結束或 abandonAll() 沖銷才算一筆", False, None, "t-box-visibility"),
        ("update：sink 未接時攢著", "上限 64 筆，接上才補送，滿了直接丟棄", False, None, "t-update"),
        ("local-exec：新的頂替舊的", "模組級單例，卸載只清自己安裝的那支", False, None, "t-local-exec"),
        ("unclean-exit：分級不排隊", "marker_orphaned 才是 info，其餘一律 warn", False, None, "t-unclean-exit"),
    ])
    t.drop("條件不成立，正常送出")
    t.set_lane("sink")
    t.sbox("attach 之後併入 desktop-log 上傳器", "attach 前的暫存不會遺失，接上才補送",
           h=64, snip="t8-lifecycle-attach")
    return t, "四個功能模組各自帶一層小緩衝或分級規則（開窗未關、sink 未接、模組單例、結算分級），最終仍併入 desktop-log 家族同一份上傳器；緩衝 policy 各不相同，是這個家族存在的理由。"


def sentry_direct() -> tuple[tg.Tree, str]:
    t = tg.Tree()
    t.set_lane("emit")
    t.sbox("錯誤與當機事件", "warning／crash／startup-failure／invariant 四類", h=64,
           snip="t-sentry")
    t.drop()
    t.sbox("對話情境事件", "sentryConversation 一類", h=64, snip="t8-pipes-full")
    t.drop()
    t.set_lane("adapter")
    t.sbox("sentry.ts 包住 @sentry/electron", "captureMessage／captureException 兩支方法",
           snip="t-sentry")
    t.drop()
    t.set_lane("sink")
    _, cy = t.diamond("Sentry 這次送得出去？")
    t.outs(cy, [("送不出就跳過", "不重試也不計數，沒有排隊層", True)], no_label=None)
    t.drop("送出")
    return t, "五類事件都直接呼叫 sentry.ts 的包裝方法；有 SandSentryAdapter port 與 no-op 預設，沒有中間佇列，送不出就跳過。"


def analytics_direct() -> tuple[tg.Tree, str]:
    t = tg.Tree()
    t.set_lane("emit")
    t.sbox("onboarding 步驟事件", "onboardingStep 一類", h=64)
    t.drop()
    t.set_lane("port")
    t.sbox("ProductAnalytics port", "trackEvent 一支方法", snip="t8-adapter-host")
    t.drop()
    t.set_lane("adapter")
    t.sbox("SandProductAnalytics", "跟 host 的結構化日誌 adapter 同一支建構式蓋出來",
           snip="t8-adapter-host")
    t.drop()
    t.set_lane("sink")
    _, cy = t.diamond("canRecordEvents() 允許？")
    t.outs(cy, [("直接丟棄", "未 activate 或 gate 關閉時不重試不計數", True)], no_label=None)
    t.drop("允許")
    return t, "全文件唯一一條打進產品分析後端的事件；gate 沒開就整包丟棄，跟 Sentry 一樣沒有佇列層。"


FAMILIES = {
    "host-turn": host_turn,
    "desktop-log": desktop_log,
    "coordinator-agg": coordinator_agg,
    "transport-stage": transport_stage,
    "feature-buffered": feature_buffered,
    "sentry-direct": sentry_direct,
    "analytics-direct": analytics_direct,
}


# SVG-internal did/label must never spell "coordinator" (the wording gate greps
# the raw SVG for the English glossary term); the JSON family id keeps the English name.
SAFE_LABEL = {
    "coordinator-agg": ("s8-aggregate", "telemetry 中介行程聚合家族"),
}
# telemetryTrees.ts is generated TS source, also scanned for the term: the exported
# TREES object key must not spell "coordinator" either, even though the JSON family
# id and the .svg filename on disk keep the English name "coordinator-agg".
TS_KEY = {
    "coordinator-agg": "aggregate",
}


def main() -> None:
    trees: dict[str, str] = {}
    for name, build in FAMILIES.items():
        t, caption = build()
        did, label = SAFE_LABEL.get(name, (f"s8-{name}", f"telemetry {name} 家族"))
        svg = t.render(did=did, label=label, caption=caption)
        (HERE / f"telemetry-{name}.svg").write_text(svg, encoding="utf-8")
        trees[TS_KEY.get(name, name)] = svg
        print("wrote", f"telemetry-{name}.svg")

    lines = ["export const TREES: Record<string, string> = {"]
    for name, svg in trees.items():
        lines.append(f"  \"{name}\": `\n{svg.replace(chr(96), chr(92) + chr(96))}`,")
    lines.append("};")
    (HERE / "telemetryTrees.ts").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("wrote", HERE / "telemetryTrees.ts")


if __name__ == "__main__":
    main()

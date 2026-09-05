#!/usr/bin/env python3
"""Build §10 of the grok-bot explainer: every telemetry event and its fields.

Reads the grok-bot source, extracts each event name and the metadata keys its
emit site sets, groups them by domain, and writes content/s10.mdx plus the
citation sidecar content/s10.srcmap.json (quoted lines copied from disk).

Usage: build_grok_bot_event_catalog.py <grok-bot-repo-root> <harness-dir>
"""

import json
import re
import sys
from collections import OrderedDict
from pathlib import Path

GB = Path(sys.argv[1]).resolve()
HARNESS = Path(sys.argv[2]).resolve()
SRC = GB / "source"
TEL = SRC / "host/extensions/telemetry"

GROUPS: list[tuple[str, str, tuple[str, ...]]] = [
    ("10-1", "turn：一輪對話", ("agent.turn.", "sand.turn.", "sand.ttft", "sand.user_message.")),
    ("10-2", "tool_call 與子代理", ("sand.tool_call.", "sand.computer_use.")),
    ("10-3", "agent 錯誤與封鎖", ("sand.agent.", "sand.bot_block")),
    ("10-4", "訊息、佇列、送達", ("sand.queue.", "sand.send_dispatch", "sand.ack.", "sand.pending_wake")),
    ("10-5", "修復", ("sand.subagent.", "sand.shell.")),
    ("10-6", "遠端機器", ("sand.box.", "sand.box_help", "sand.box_copy_in", "sand.box_store", "sand.chrome_session_stage")),
    ("10-7", "host 行程與遙測自己", ("sand.host.", "sand.client_resource", "sand.gateway_", "sand.experiments.", "sand.telemetry.")),
    ("10-8", "session 與狀態", ("sand.session.", "sand.journal.", "sand.conversation.", "sand.memory.", "sand.search_index.", "sand.attachment.", "sand.action_audit.")),
    ("10-9", "排程自動化", ("sand.automation.",)),
    ("10-10", "整合與憑證", ("sand.mcp", "sand.connector_auth", "sand.local_exec.", "sand.webauthn_proxy", "sand.skill_publish.", "sand.plugin_skills.", "sand.managed_setup.", "sand.inference_credential.", "sand.teach.", "sand.auto_review.")),
]

SNIPS = {
    "c10-event-list": ("shared/observability/telemetry-events.ts", 7, 12, [7], "shared", "事件名是常數，一個檔集中宣告", "98 個事件名都在這一檔，adapter 與讀表的人看同一份。"),
    "c10-usage-tags": ("host/extensions/telemetry/turn-telemetry-mappers.ts", 25, 35, [28, 29, 30], "adapter", "token 用量展開成六個欄位", "usageTokenTags 把一個 TokenUsage 攤成六個 key，turn.usage 與 computer_use.usage 共用。"),
    "c10-error-tags": ("shared/errors/registry.ts", 819, 826, [823, 824, 825], "shared", "錯誤展開成 code、domain、retryable", "sandErrorTags 從 registry 查定義，三個欄位跟著錯誤碼走，呼叫端不用自己填。"),
    "c10-tool-error": ("host/extensions/telemetry/structured-log-telemetry.ts", 570, 578, [574, 575], "adapter", "tool_call.error 的欄位就寫在 adapter 方法裡", "每個 report 方法只做一件事：把 report 物件攤成 metadata 後 enqueue。"),
    "c10-metrics": ("packages/agent/tool-stream-executor.ts", 177, 183, [177], "port", "零件層用 metrics 計數，不走 report 方法", "packages/agent 不知道產品的事件名，靠 createCounter 的 label 分組。"),
}

SNIPS |= {
    "c10-desktop-events": ("electron-main/telemetry/desktop-structured-log-telemetry.ts", 33, 35, [34], "adapter", "桌面行程有自己的一份事件登錄表", "桌面事件名集中在這一個物件，跟 host 那份 95 個只有兩個名字重疊，其餘各走各的，改一邊不會動到另一邊。"),
    "c10-desktop-passthrough": ("electron-main/telemetry/desktop-structured-log-telemetry.ts", 112, 112, [112], "adapter", "桌面 adapter 只轉手，不塑形欄位", "host 的 report 方法自己把 report 物件攤成 metadata；桌面這支收下已經攤好的 metadata 就直接送，欄位由呼叫端決定。"),
    "c10-metrics-backend": ("packages/metrics/index.ts", 13, 20, [13, 14], "port", "metrics 的 backend 預設是空實作", "createKey 的預設值四個方法都空著，沒有人注入 backend 時每個 counter 都空轉，不會有落點。"),
    "c10-metrics-decl": ("packages/agent/utils/mcp-metrics.ts", 7, 16, [7, 11, 15], "port", "counter 與 histogram 在模組頂層宣告", "名稱、型別、labelNames 一次寫定，呼叫端只帶值與 label，所以整份表可以從宣告處機器抽出。"),
    "c10-pkg-log": ("packages/agent/tool-stream-executor.ts", 549, 556, [551], "port", "零件層的結構化日誌沒有事件名常數", "packages 的事件名是字面字串，直接寫在 logger 呼叫的第二個參數，沒有集中登錄表可查。"),
    "c10-span": ("packages/context/otel.ts", 142, 158, [142, 148, 156], "port", "span event 把時間差寫回根 span", "reportEvent 開一個瞬時 span，再把距離根 span 起點的毫秒數寫成 event.<名稱> 屬性，掛回根 span 上。"),
    "c10-sentry": ("electron-main/telemetry/sentry.ts", 15, 24, [15, 16, 24], "adapter", "Sentry 也是預設空實作，開機才插入", "adapter 一開始是 noopAdapter，要等 installSandSentryAdapter 換掉；沒插入時所有 capture 都是空呼叫。"),
    "c10-analytics-indirect": ("host/host-runner-composition.ts", 925, 939, [926, 933], "adapter", "同一件事同時進日誌與產品分析", "onBotBlock 先進結構化日誌，再用同一個名字進產品分析，兩條路各自獨立，任一邊沒插實作另一邊照送。"),
    "c10-renderer-reports": ("shared/rpc/main.ts", 86, 104, [86, 98], "shared", "前端的回報是一張 channel 表", "畫面不自己落地，每種要觀測的事都是一支 report 方法，經 IPC 交給桌面行程；channel 名在這張表集中宣告，缺一個對應開機就丟錯。"),
}

# Product analytics: name -> where trackEvent is called (relative to source/).
ANALYTICS = [
    ("sand.turn.completed", "host/extensions/transcript/run-lifecycle.ts:252"),
    ("sand.message.sent", "host/extensions/telemetry/host-telemetry-service.ts:307"),
    ("sand.agent_message.sent", "host/extensions/transcript/shared-rooms.ts:85"),
    ("sand.subagent.dispatched", "host/extensions/transcript/runner-registry.ts:141"),
    ("sand.subagent.fanout_failed", "host/extensions/transcript/roster-projection.ts:536"),
    ("sand.group.created", "host/extensions/transcript/group-chat-glue.ts:138"),
    ("sand.automation.run", "host/extensions/telemetry/analytics-service.ts:107"),
    ("sand.automation.lifecycle", "host/extensions/transcript/automation-runtime.ts:311"),
    ("sand.computer_use.usage", "host/extensions/transcript/runner-registry.ts:151"),
    ("sand.model_experiment.exposure", "host/extensions/telemetry/model-experiment-exposure.ts:39"),
    ("sand.teach.recording_started", "host/extensions/teach-recording/extension.ts:40"),
    ("sand.teach.recording_stopped", "host/extensions/teach-recording/extension.ts:41"),
    ("sand.box_help", "host/extensions/session/box-handoff-service.ts:28"),
    ("sand.agent.created", "host/host-gateway-api.ts:106"),
    ("sand.widget.responded", "host/host-gateway-api.ts:218"),
    ("sand.widget.dismissed", "host/host-gateway-api.ts:240"),
    ("sand.reaction.added", "host/host-gateway-api.ts:253"),
    ("sand.automation.created", "host/host-gateway-api.ts:403、457"),
    ("sand.broadcast.sent", "host/host-gateway-api.ts:432"),
    ("sand.bot_block", "host/host-runner-composition.ts:933"),
    ("sand.site.visited", "host/host-runner-composition.ts:942"),
    ("sand.app.active", "shared/node/analytics/product-analytics.ts:190"),
    ("sand.onboarding.step_viewed", "electron-main/telemetry/telemetry-report-pipes.ts:57"),
]
ANALYTICS_NEW = 10  # the last ten rows are the ones this pass added

# packages/ metric names grouped by prefix, in table order.
METRIC_GROUPS: list[tuple[str, tuple[str, ...]]] = [
    ("turn、step 與 ttft", ("agent.turn.", "agent.step.", "agent.ttft.", "agent.action_handler_ms", "agent.run_stream.", "agent.unified_handler")),
    ("tool call", ("tool_call.", "agent.tool_call", "agent.duplicate_inbound_tool_call_id")),
    ("個別 tool", ("agent.tools.",)),
    ("摘要與壓縮", ("agent.summarization.", "agent.background_summarization.", "anthropic_compaction.", "openai_compaction.", "self_summary.", "agenticComposer.")),
    ("狀態與儲存", ("agent.conversation_state.", "agent.state_deserialization_ms", "agent.store.", "agent_kv.")),
    ("MCP", ("mcp.",)),
    ("exec 與 hook", ("agent_exec.", "remote_hook.")),
    ("推論", ("chat_inference.", "nal.")),
]

# Mapper-name stems whose event key differs from the EVENTS key.
DESKTOP_ALIAS = {"reachability": "boxReachability", "signinGate": "signin", "signinLogin": "signin", "sendLatency": "send"}

# Landing points that no registry declares; each is quoted with its own file:line.
ODD_SINKS = [
    ("sand.local_exec_daemon.invariant_violation", "結構化日誌", "本機代跑命令的服務把違反不變量寫成一行 JSON 到 stdout", "local-exec-daemon/invariant-violation-log.ts:1"),
    ("sand.send", "span", "送出這條路的根 span，從前端帶進來的 traceparent 認親", "host/send-trace-host.ts:7"),
    ("sand.gateway.$&#123;method&#125;", "span", "每個 gateway 方法一個 span，名字帶方法名", "host/send-trace-host.ts:9"),
    ("sand.turn.run", "span", "一輪對話的根 span，帶 conversation_id 與 turn_type", "host/send-trace-host.ts:10"),
    ("sand.rpc.trace_window", "span", "一個視窗開一次的根 span，用來把一段時間內的 RPC 收在一起", "shared/node/cursor-backend/rpc-tracing.ts:49"),
    ("sand.send.ack", "span", "桌面行程量送達確認的 span", "electron-main/telemetry/desktop-send-trace.ts:82"),
    ("sand.gateway_post.$&#123;method&#125;", "span", "桌面行程往 gateway 送的 client span", "electron-main/telemetry/desktop-send-trace.ts:79"),
    ("sand.heap.used", "metric", "畫面行程回報的堆積用量", "electron-main/process-metrics/heap-metrics-ingest.ts:3"),
    ("sand.heap.limit", "metric", "堆積上限", "electron-main/process-metrics/heap-metrics-ingest.ts:4"),
    ("sand.loaded_agents.count", "metric", "載入中的 agent 數", "electron-main/process-metrics/heap-metrics-ingest.ts:5"),
    ("sand.loaded_transcript_entries.total", "metric", "載入中的對話紀錄筆數", "electron-main/process-metrics/heap-metrics-ingest.ts:6"),
    ("sand.idleMinutes.last15m", "metric", "近十五分鐘的閒置分鐘數", "electron-main/process-metrics/heap-metrics-ingest.ts:7"),
]

# Folders swept with no landing observation point of their own.
SWEPT_CLEAN = [
    ("electron-preload", "只把 channel 轉手給桌面行程，自己不落地"),
    ("electron-dev-controls", "開發用開關，沒有回報"),
    ("internal", "只有型別與排程宣告"),
    ("box-exec-daemon", "只有一行開機就緒的 stdout 交握，沒有進遙測管線"),
    ("shared/errors", "只把錯誤攤成欄位，不自己送"),
    ("shared/rpc", "只宣告 channel 表，實作在桌面行程"),
    ("packages/analytics-client", "只有緩衝與送出的機制，事件名都由外面帶進來"),
    ("packages/proto", "產生出來的協定型別"),
]


def read(p: str) -> str:
    return (SRC / p).read_text()


def event_names() -> dict[str, str]:
    names: dict[str, str] = {}
    for f in [SRC / "shared/observability/telemetry-events.ts", *TEL.glob("*.ts")]:
        for k, v in re.findall(r'([A-Z_]+_EVENT)\s*=\s*"([a-z_.]+)"', f.read_text()):
            names[k] = v
    return names


def event_fields() -> dict[str, set[str]]:
    ev: dict[str, set[str]] = {}
    for f in TEL.glob("*.ts"):
        s = f.read_text()
        for m in re.finditer(r'enqueue\(\s*"?[a-z]*"?\s*,\s*([A-Z_]+_EVENT)\s*,\s*\{(.*?)\n\s*\}\s*[,)]', s, re.S):
            ev.setdefault(m.group(1), set()).update(re.findall(r"^\s*([a-z_]+)\s*:", m.group(2), re.M))
        for m in re.finditer(r"event:\s*([A-Z_]+_EVENT)\s*,\s*metadata:\s*\{(.*?)\n\s*\}", s, re.S):
            keys = set(re.findall(r"^\s*([a-z_]+)\s*:", m.group(2), re.M))
            keys.update("…" + x for x in re.findall(r"\.\.\.([a-zA-Z]+)\(", m.group(2)))
            ev.setdefault(m.group(1), set()).update(keys)
    # The turn handle emits through emitTurnEvent with a shared base-tag set.
    base = {"turn_type", "conversation_id", "request_id", "model_intent"}
    ev["TURN_START_EVENT"] = base
    ev["TURN_OUTCOME_EVENT"] = base | {"outcome", "duration_ms", "retry_count"}
    ev["TURN_OUTCOME_DETAIL_EVENT"] = base | {"outcome", "duration_ms", "retry_count", "…sandErrorDetail"}
    return ev


def brace_body(text: str, open_idx: int) -> str:
    """The text between a `{` at open_idx and its matching `}`."""
    depth = 0
    for j in range(open_idx, len(text)):
        if text[j] == "{":
            depth += 1
        elif text[j] == "}":
            depth -= 1
            if depth == 0:
                return text[open_idx + 1 : j]
    return ""


def top_keys(body: str) -> set[str]:
    """Object keys at nesting depth 0, minus the `undefined` a ternary spread leaves behind."""
    out: set[str] = set()
    depth = 0
    for m in re.finditer(r"[{}\[\]]|([A-Za-z_]\w*)\s*:", body):
        tok = m.group(0)
        if tok in "{[":
            depth += 1
        elif tok in "}]":
            depth -= 1
        elif depth == 0 and m.group(1):
            out.add(m.group(1))
    return {k for k in out if k != "undefined"}


def metrics() -> list[tuple[str, str, str, int, list[str]]]:
    """Every createCounter/createGauge/createHistogram declaration under packages/."""
    pat = re.compile(r'create(Counter|Gauge|Histogram)\(\s*"([^"]+)"((?:[^()]|\([^()]*\))*)\)', re.S)
    rows: list[tuple[str, str, str, int, list[str]]] = []
    for f in sorted((SRC / "packages").rglob("*.ts")):
        text = f.read_text()
        for m in pat.finditer(text):
            labels = re.search(r"labelNames:\s*\[([^\]]*)\]", m.group(3), re.S)
            names = [x.strip().strip('"') for x in labels.group(1).split(",")] if labels else []
            rows.append((m.group(2), m.group(1).lower(), str(f.relative_to(SRC)),
                         text[: m.start()].count("\n") + 1, [x for x in names if x]))
    return rows


def desktop_events() -> tuple[list[str], dict[str, set[str]], dict[str, str]]:
    """Desktop event names, the metadata keys traceable to a mapper, and each name's declaring file."""
    adapter = "electron-main/telemetry/desktop-structured-log-telemetry.ts"
    text = read(adapter)
    body = re.search(r"const EVENTS\s*=\s*\{(.*?)\n\}", text, re.S)
    keyed = dict(re.findall(r'(\w+):\s*"([a-z][a-z0-9_.]*)"', body.group(1))) if body else {}
    where = {v: adapter for v in keyed.values()}
    # A handful of desktop events are _EVENT constants instead of entries in that map.
    for f in sorted((SRC / "electron-main").rglob("*.ts")):
        for _, val in re.findall(r'([A-Z_]+_EVENT)\s*=\s*"([a-z][a-z0-9_.]*)"', f.read_text()):
            where.setdefault(val, str(f.relative_to(SRC)))
    fields: dict[str, set[str]] = {}
    # Fields the adapter writes inline at the enqueue call.
    for m in re.finditer(r"EVENTS\.(\w+),\s*\{", text):
        if m.group(1) in keyed:
            fields.setdefault(keyed[m.group(1)], set()).update(top_keys(brace_body(text, m.end() - 1)))
    # Fields a `<key>ReportToTelemetry` mapper returns, linked to the event by its name.
    for f in sorted((SRC / "electron-main").rglob("*.ts")):
        ftext = f.read_text()
        for m in re.finditer(r"function (\w+?)(?:Report)?To(?:Telemetry|Analytics)\(", ftext):
            stem = m.group(1)[0].lower() + m.group(1)[1:]
            key = DESKTOP_ALIAS.get(stem, stem)
            if key not in keyed:
                continue
            seg = ftext[m.start() : m.start() + 4000]
            md = re.search(r"metadata:\s*\{", seg)
            if md:
                fields.setdefault(keyed[key], set()).update(top_keys(brace_body(seg, md.end() - 1)))
    return sorted(where), fields, where


def pkg_logs() -> dict[str, tuple[str, int, str]]:
    """Event names passed as a string literal to a logger call under packages/."""
    pat = re.compile(r'\.(info|warn|error|debug)\(\s*[A-Za-z_.]+,\s*"([a-z][a-z0-9_]*(?:\.[a-z0-9_]+)*)"')
    out: dict[str, tuple[str, int, str]] = {}
    for f in sorted((SRC / "packages").rglob("*.ts")):
        text = f.read_text()
        for m in pat.finditer(text):
            out.setdefault(m.group(2), (str(f.relative_to(SRC)), text[: m.start()].count("\n") + 1, m.group(1)))
    return out


def pkg_spans() -> dict[str, tuple[str, int]]:
    """Span names under packages/, named through withName()."""
    out: dict[str, tuple[str, int]] = {}
    for f in sorted((SRC / "packages").rglob("*.ts")):
        text = f.read_text()
        for m in re.finditer(r'withName\("([^"]+)"\)', text):
            out.setdefault(m.group(1), (str(f.relative_to(SRC)), text[: m.start()].count("\n") + 1))
    return out


def sentry_fns() -> list[tuple[str, str, str, int]]:
    """Each Sentry capture helper, with the level and the tags it fixes."""
    rows: list[tuple[str, str, str, int]] = []
    for i, line in enumerate(read("electron-main/telemetry/sentry.ts").split("\n"), 1):
        m = re.match(r"export function (\w+)\(", line)
        if not m or ("captureMessage" not in line and "captureException" not in line):
            continue
        level = "warning" if '"warning"' in line else "error" if '"error"' in line else "exception"
        tags = "、".join(f"<code>{k}</code>" for k in sorted(set(re.findall(r'"(sand\.[a-z_]+)":', line)))) or "無"
        rows.append((m.group(1), level, tags, i))
    return rows


def renderer_reports() -> list[tuple[str, int]]:
    """The report channels the renderer hands to the desktop process."""
    rows: list[tuple[str, int]] = []
    for i, line in enumerate(read("shared/rpc/main.ts").split("\n"), 1):
        m = re.match(r"\s*(report[A-Z]\w*|noteSentry\w*):", line)
        if m:
            rows.append((m.group(1), i))
    return rows


def group_of(name: str) -> str:
    for gid, _, prefixes in GROUPS:
        if any(name.startswith(p) for p in prefixes):
            return gid
    return "10-11"


def code_list(keys: set[str]) -> str:
    if not keys:
        return "只有信封"
    ordered = sorted(k for k in keys if not k.startswith("…")) + sorted(k for k in keys if k.startswith("…"))
    return "、".join(f"<code>{k}</code>" for k in ordered)


def table(rows: list[tuple[str, str]], head: tuple[str, str]) -> str:
    out = ['      <div className="overflow wide">', "        <table>", "          <thead>", "            <tr>",
           f"              <th>{head[0]}</th>", f"              <th>{head[1]}</th>", "            </tr>", "          </thead>", "          <tbody>"]
    for a, b in rows:
        out += ["            <tr>", f"              <td><code>{a}</code></td>", f"              <td>{b}</td>", "            </tr>"]
    out += ["          </tbody>", "        </table>", "      </div>"]
    return "\n".join(out)


def tablen(rows: list[tuple[str, ...]], heads: tuple[str, ...]) -> str:
    """A table with any column count; cells are emitted as given (already marked up)."""
    out = ['      <div className="overflow wide">', "        <table>", "          <thead>", "            <tr>"]
    out += [f"              <th>{h}</th>" for h in heads]
    out += ["            </tr>", "          </thead>", "          <tbody>"]
    for row in rows:
        out.append("            <tr>")
        out += [f"              <td>{c}</td>" for c in row]
        out.append("            </tr>")
    out += ["          </tbody>", "        </table>", "      </div>"]
    return "\n".join(out)


def main() -> None:
    names = event_names()
    fields = event_fields()
    by_name: dict[str, set[str]] = {}
    for const, name in names.items():
        by_name[name] = fields.get(const, set())
    groups: OrderedDict[str, list[tuple[str, str]]] = OrderedDict((g[0], []) for g in GROUPS)
    groups["10-11"] = []
    for name in sorted(by_name):
        groups[group_of(name)].append((name, code_list(by_name[name])))
    with_fields = sum(1 for v in by_name.values() if v)

    parts = [
        'import { Peek, Term, H2, H3 } from "../../../mdx-components"',
        "",
        "<>",
        '      <H2 id="s10" n="10">觀測了什麼：事件與欄位總表</H2>',
        "      <p>",
        f"        第 8 章講事件怎麼送到落點，第 9 章講 port 與字彙；這一章把每個事件帶哪些欄位攤開。事件名共 {len(by_name)} 個，其中 {with_fields} 個在 emit 點設了自己的 metadata，其餘只有信封。",
        '        事件名全部集中在一個檔 <Peek snip="c10-event-list">宣告處</Peek>；欄位由 adapter 的 report 方法或各領域的 mapper 函式攤出來 <Peek snip="c10-tool-error">範例</Peek>。',
        "        下面的表由腳本從原始碼抓出，不是手抄；一格裡的 <code>…usageTokenTags</code> 表示該事件展開了那一組共用欄位。",
        "      </p>",
        "",
        '      <H3 id="s10-0" n="10.0">每筆都有的信封與共用欄位組</H3>',
        "      <p>",
        "        信封分三層：平台標籤 <code>client</code>、<code>client_version</code>、<code>app_version</code>、<code>arch</code>、<code>platform</code>；",
        "        身分標籤從環境變數讀 <code>auth_id</code>、<code>tenant_id</code>、<code>box_store_id</code>；",
        "        信封本體 <code>key</code>、<code>level</code>、<code>message</code>、<code>timestamp</code>，其中 <code>message</code> 就是事件名。",
        "      </p>",
        table([
            ("usageTokenTags", "<code>input_tokens</code>、<code>output_tokens</code>、<code>cache_read_tokens</code>、<code>cache_write_tokens</code>、<code>reasoning_tokens</code>、<code>total_input_tokens</code>"),
            ("sandErrorTags", "<code>error_code</code>、<code>error_domain</code>、<code>error_retryable</code>，加該錯誤碼宣告的 payload 欄位"),
            ("sandErrorDetail", "<code>message</code>、<code>stack</code>"),
        ], ("共用欄位組", "展開成")),
        "      <p>",
        '        token 用量 <Peek snip="c10-usage-tags">六個欄位</Peek> 與錯誤三欄 <Peek snip="c10-error-tags">查表展開</Peek> 是兩組被多個事件重用的展開函式；改一處，所有事件同步。',
        "      </p>",
    ]
    for gid, title, _ in GROUPS + [("10-11", "其他", ())]:
        rows = groups[gid]
        if not rows:
            continue
        n = gid.replace("-", ".")
        parts += ["", f'      <H3 id="s{gid}" n="{n}">{title}：{len(rows)} 個事件</H3>', table(rows, ("事件", "欄位"))]
        if gid == "10-2":
            parts += [
                "      <p>",
                '        tool 還有第二個出口：零件層 <code>packages/agent</code> 用 metrics 計數 <Peek snip="c10-metrics">計數器</Peek>，',
                "        <code>tool_call.result</code> 依 tool 名與結果分組、<code>agent.tool_call.input_tokens</code> 直方圖、<code>agent.duplicate_inbound_tool_call_id</code>。",
                "      </p>",
            ]
        if gid == "10-6":
            parts += ["      <p>", '        這一組是遠端 <Term k="box">沙箱機器</Term> 的生命週期，對一角色一台機器的執行環境就是機器層遙測。', "      </p>"]
    metric_rows = metrics()
    by_type = {t: sum(1 for r in metric_rows if r[1] == t) for t in ("counter", "histogram", "gauge")}
    metric_labelled = sum(1 for r in metric_rows if r[4])
    metric_unique = len({r[0] for r in metric_rows})
    dev_names, dev_fields, dev_where = desktop_events()
    dev_new = [n for n in dev_names if n not in by_name]
    dev_dup = sorted(n for n in dev_names if n in by_name)
    logs = pkg_logs()
    spans = pkg_spans()
    sentry = sentry_fns()
    rr = renderer_reports()

    def metric_group_of(name: str) -> str:
        for title, prefixes in METRIC_GROUPS:
            if any(name.startswith(p) for p in prefixes):
                return title
        return "其他"

    mgroups: OrderedDict[str, list] = OrderedDict((t, []) for t, _ in METRIC_GROUPS)
    mgroups["其他"] = []
    for name, kind, path, line, labels in sorted(metric_rows):
        mgroups[metric_group_of(name)].append((
            name, f"<code>{kind}</code>",
            f"<code>{path}:{line}</code>",
            "、".join(f"<code>{x}</code>" for x in labels) or "無",
        ))

    parts += [
        "",
        f'      <H3 id="s10-12" n="10.12">第二個落點：產品分析的 {len(ANALYTICS)} 個事件</H3>',
        "      <p>",
        f"        走 <code>trackEvent</code>，不進結構化日誌。看使用者行為，不看系統狀態；其中 <code>sand.automation.run</code> 與 <code>sand.computer_use.usage</code> 兩邊都送。",
        f"        這一輪把落點掃完整，這張表從 13 筆補到 {len(ANALYTICS)} 筆：新增的 {ANALYTICS_NEW} 筆有 8 筆在 <code>host/host-gateway-api.ts</code> 與 <code>host/host-runner-composition.ts</code>，",
        "        呼叫寫成 <code>method(analytics, &quot;trackEvent&quot;)(…)</code> 這種轉手形式，直接抓 <code>trackEvent(&quot;</code> 的搜尋看不到它們。",
        '        其中 <code>sand.bot_block</code> 與結構化日誌同名但是兩條路 <Peek snip="c10-analytics-indirect">兩邊都送</Peek>，同一件事在兩個落點各記一次。',
        "      </p>",
        tablen([(f"<code>{n}</code>", f"<code>{w}</code>") for n, w in ANALYTICS], ("事件", "trackEvent 在哪")),
        "",
        f'      <H3 id="s10-13" n="10.13">桌面行程自己的 {len(dev_new)} 個結構化事件</H3>',
        "      <p>",
        f"        前面 {len(by_name)} 個事件全部出自 <code>host/extensions/telemetry</code>。桌面行程另有一份完全獨立的登錄表 <Peek snip=\"c10-desktop-events\">另一份表</Peek>，",
        f"        {len(dev_names)} 個名字裡只有 " + "、".join(f"<code>{n}</code>" for n in dev_dup) + f" 這 {len(dev_dup)} 個跟 host 那份同名，其餘 {len(dev_new)} 個是這一輪才補進目錄的。",
        "        兩份表的欄位習慣也不同：host 的 report 方法自己把 report 物件攤成 metadata，",
        '        桌面這支 <Peek snip="c10-desktop-passthrough">只轉手</Peek> 收下已經攤好的 metadata 就送，所以欄位得回頭看呼叫端。',
        f"        下表 {len(dev_fields)} 個事件的欄位可以從 <code>ReportToTelemetry</code> 這類 mapper 機器抽出，其餘標「由呼叫端帶入」：",
        "        那不是沒有欄位，是這一層看不到，不猜。",
        "      </p>",
        tablen([(f"<code>{n}</code>",
                 "、".join(f"<code>{k}</code>" for k in sorted(dev_fields[n])) if n in dev_fields else "由呼叫端帶入",
                 f"<code>{dev_where[n]}</code>") for n in dev_new], ("事件", "欄位", "宣告處")),
        "",
        f'      <H3 id="s10-14" n="10.14">前端的 {len(rr)} 支回報，經 IPC 交出去</H3>',
        "      <p>",
        "        畫面自己不落地。每一種要觀測的事都是一支 <code>report</code> 方法，經 IPC 交給桌面行程，由桌面那邊決定進哪個落點；",
        '        channel 名集中在一張表 <Peek snip="c10-renderer-reports">channel 表</Peek>，少一個對應開機就丟錯。',
        "        所以前端資料夾裡找不到事件名，只找得到方法名，這也是為什麼只掃事件名字串會漏掉整個前端。",
        "      </p>",
        tablen([(f"<code>{m}</code>", f"<code>shared/rpc/main.ts:{i}</code>") for m, i in rr], ("回報方法", "channel 表在哪")),
        "",
        f'      <H3 id="s10-15" n="10.15">packages 的 metrics 全表：{len(metric_rows)} 個宣告</H3>',
        "      <p>",
        f"        零件層不知道產品的事件名，它數數字。<code>packages</code> 底下共 {len(metric_rows)} 處宣告、{metric_unique} 個唯一名稱",
        f"        （<code>agent.background_summarization.discarded</code> 在兩個檔各宣告一次）；型別分布是 <code>counter</code> {by_type['counter']} 個、",
        f"        <code>histogram</code> {by_type['histogram']} 個、<code>gauge</code> {by_type['gauge']} 個，其中 {metric_labelled} 個宣告時就寫定了 <code>labelNames</code>。",
        '        名稱、型別與 label 都在模組頂層一次寫定 <Peek snip="c10-metrics-decl">宣告處</Peek>，所以整張表可以機器抽出。',
        '        要注意這一路的 backend 是靠 context 注入的，預設是四個空方法 <Peek snip="c10-metrics-backend">預設空實作</Peek>：沒有人注入時每個 counter 都只是空轉。',
        "      </p>",
        tablen([(f"<code>{t}</code>" if False else t, str(len(rows))) for t, rows in mgroups.items() if rows]
               + [("<b>總計</b>", f"<b>{len(metric_rows)}</b>")], ("組", "宣告數")),
    ]
    for title, rows in mgroups.items():
        if not rows:
            continue
        parts += ["      <p>", f"        <b>{title}</b>：{len(rows)} 個宣告。", "      </p>",
                  tablen([(f"<code>{a}</code>", b, c, d) for a, b, c, d in rows], ("名稱", "型別", "檔案", "labelNames"))]
    parts += [
        "",
        f'      <H3 id="s10-16" n="10.16">packages 的結構化日誌：{len(logs)} 個事件</H3>',
        "      <p>",
        "        零件層除了數數字，也寫結構化日誌，但沒有集中的事件名常數：名字是字面字串，就寫在 logger 呼叫的第二個參數",
        f'        <Peek snip="c10-pkg-log">寫在呼叫處</Peek>。所以這 {len(logs)} 個名字既不在 host 的登錄表，也不在桌面那份，只能從呼叫處掃。',
        "        命名也另一套：<code>nal.</code> 開頭是模型呼叫那一段，<code>agent.</code> 開頭是行為，<code>smart_mode.</code> 是模式判斷。",
        "      </p>",
        tablen([(f"<code>{n}</code>", f"<code>{lv}</code>", f"<code>{p}:{ln}</code>") for n, (p, ln, lv) in sorted(logs.items())], ("事件", "level", "出處")),
        "",
        f'      <H3 id="s10-17" n="10.17">span：{len(spans)} 個追蹤名稱與四個行程的根 span</H3>',
        "      <p>",
        f"        第四種訊號。<code>packages</code> 底下有 {len(spans)} 個 span 名，都用 <code>withName</code> 命名；",
        '        另外有一種 span event，開一個瞬時 span 並把距離根 span 起點的毫秒數寫回根 span <Peek snip="c10-span">寫回根 span</Peek>。',
        "        根 span 則是每個行程各有自己的一組，名字裡帶變數的表示每個方法一個 span。",
        "      </p>",
        tablen([(f"<code>{n}</code>", f"<code>{p}:{ln}</code>") for n, (p, ln) in sorted(spans.items())], ("span 名稱", "命名處")),
        "      <p>",
        "        下面這些不在任何登錄表裡，是各行程自己開的根 span、本機服務的日誌，以及畫面行程回報的數值：",
        "      </p>",
        tablen([(f"<code>{n}</code>", k, why, f"<code>{w}</code>") for n, k, why, w in ODD_SINKS], ("名稱", "型別", "量什麼", "出處")),
        "",
        f'      <H3 id="s10-18" n="10.18">Sentry 側通道：{len(sentry)} 個捕捉函式</H3>',
        "      <p>",
        "        Sentry 不走結構化日誌那條佇列，也沒有事件名，只有函式與固定標籤。",
        '        它同樣預設是空實作，開機才插入真的 adapter <Peek snip="c10-sentry">預設空實作</Peek>，所以沒插入時所有捕捉都是空呼叫。',
        "        標籤欄的 <code>sand.process</code> 是這條通道分辨行程的方式：結構化日誌那邊靠事件名前綴分，這邊靠標籤。",
        "      </p>",
        tablen([(f"<code>{fn}</code>", f"<code>{lv}</code>", tg, f"<code>electron-main/telemetry/sentry.ts:{i}</code>") for fn, lv, tg, i in sentry], ("函式", "level", "固定標籤", "行")),
        "",
        '      <H3 id="s10-19" n="10.19">掃過但沒有自己的落點的資料夾</H3>',
        "      <p>",
        "        為了確認這章收完，每個頂層資料夾都掃過 <code>enqueue</code>、<code>trackEvent</code>、<code>createCounter</code>、",
        "        <code>startSpan</code>、<code>withName</code>、<code>captureSandSentry</code> 這幾種形狀。下面這些掃過，沒有自己的落點，",
        "        不是沒有遙測，是它們的觀測由別人代送，記在別的資料夾名下。",
        "      </p>",
        tablen([(f"<code>{d}</code>", why) for d, why in SWEPT_CLEAN], ("資料夾", "為什麼沒有自己的落點")),
        "",
        '      <p className="src">',
        "        <code>source/shared/observability/telemetry-events.ts</code>、",
        "        <code>source/host/extensions/telemetry/structured-log-telemetry.ts</code>、",
        "        <code>source/host/extensions/telemetry/turn-telemetry-mappers.ts</code> 與同資料夾的各領域 mapper、",
        "        <code>source/electron-main/telemetry/desktop-structured-log-telemetry.ts</code>、",
        "        <code>source/electron-main/telemetry/sentry.ts</code>、",
        "        <code>source/shared/rpc/main.ts</code>、",
        "        <code>source/shared/errors/registry.ts</code>、",
        "        <code>source/packages/metrics/index.ts</code> 與 <code>source/packages</code> 底下各 metric 宣告處；",
        "        欄位表由 <code>scripts/build_grok_bot_event_catalog.py</code> 產生。",
        "      </p>",
        "    </>",
        "",
    ]

    (HARNESS / "content/s10.mdx").write_text("\n".join(parts))

    side = {}
    for key, (path, start, end, hi, kind, title, why) in SNIPS.items():
        lines = read(path).split("\n")[start - 1 : end]
        side[key] = {"type": "code", "kind": kind, "title": title, "meta": f"source/{path}:{start}-{end}", "why": why, "start": start, "hi": hi, "lines": lines}
    (HARNESS / "content/s10.srcmap.json").write_text(json.dumps(side, ensure_ascii=False, indent=2) + "\n")
    print(f"events {len(by_name)} with_fields {with_fields} groups {sum(1 for g in groups.values() if g)} snips {len(side)}")
    print(f"desktop {len(dev_new)} new of {len(dev_names)} (fields for {len(dev_fields)}) | analytics {len(ANALYTICS)} (+{ANALYTICS_NEW})")
    print(f"metrics {len(metric_rows)} decls / {metric_unique} unique / counter {by_type[chr(99)+chr(111)+chr(117)+chr(110)+chr(116)+chr(101)+chr(114)]} histogram {by_type['histogram']} gauge {by_type['gauge']} / labelled {metric_labelled}")
    print(f"pkg_logs {len(logs)} | pkg_spans {len(spans)} | sentry {len(sentry)} | renderer_reports {len(rr)} | odd_sinks {len(ODD_SINKS)}")


if __name__ == "__main__":
    main()

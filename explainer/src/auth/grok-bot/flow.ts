import type { Flow } from "../../components/FlowDag";

export const AUTH_FLOW: Flow = {
  label: "Grok Bot 兩張票",
  phases: [
    { id: "desktop", label: "1 桌面登入" },
    { id: "host", label: "2 host 換短票" },
  ],
  steps: [
    { id: "ui", phase: "desktop", who: "畫面", label: "呼叫 loginCursor", sub: "main-edge.ts", snip: "gb-login" },
    { id: "dev", phase: "desktop", kind: "ask", label: "開發後端？", snip: "gb-which" },
    { id: "devPoll", phase: "desktop", kind: "exit", label: "開發站 poll", sub: "cursor-auth.ts", snip: "gb-which" },
    { id: "deep", phase: "desktop", label: "loginDeepControl 再 poll", sub: "auth/login.ts", snip: "gb-url" },
    { id: "poll", phase: "desktop", kind: "ask", label: "poll 有兩張票？", snip: "gb-poll" },
    { id: "notDone", phase: "desktop", kind: "fail", label: "登入沒完成", sub: "cursor-auth.ts", snip: "gb-poll" },
    { id: "write", phase: "desktop", label: "寫入 sand-secrets.json", sub: "cursor-auth.ts", snip: "gb-which" },
    { id: "onHost", phase: "host", kind: "ask", label: "這次在 host？", snip: "gb-start" },
    { id: "asar", phase: "host", kind: "exit", label: "安裝包到此為止", sub: "沒有 dist/host", snip: "gb-login" },
    { id: "cred", phase: "host", kind: "ask", label: "有續期憑證？", snip: "gb-host" },
    { id: "wait", phase: "host", kind: "fail", label: "短票還等不到", sub: "auth-service.ts", snip: "gb-host" },
    { id: "renew", phase: "host", who: "box", label: "POST inference-credential", sub: "credential-renewer.ts", snip: "gb-renew" },
    { id: "give", phase: "host", who: "box", label: "getAccessToken 交出去", sub: "extension.ts", snip: "gb-start" },
  ],
  path: ["ui", "dev", "deep", "poll", "write", "onHost", "cred", "renew", "give"],
  pathLabels: { dev: "不是", poll: "有", onHost: "是", cred: "有" },
  branches: [
    { s: "dev", t: "devPoll", label: "是" },
    { s: "poll", t: "notDone", label: "沒有" },
    { s: "onHost", t: "asar", label: "不是" },
    { s: "cred", t: "wait", label: "沒有" },
  ],
};

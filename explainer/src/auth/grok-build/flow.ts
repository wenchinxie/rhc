import type { Flow } from "../../components/FlowDag";

export const AUTH_FLOW: Flow = {
  label: "Grok Build 怎麼拿到票",
  phases: [
    { id: "source", label: "1 找現成的票" },
    { id: "method", label: "2 選登入方式" },
    { id: "loopback", label: "3 瀏覽器登入" },
  ],
  steps: [
    { id: "need", phase: "source", label: "要打模型", sub: "agent/config.rs", snip: "gb-resolve" },
    { id: "apikey", phase: "source", kind: "ask", label: "環境有 XAI_API_KEY？", snip: "gb-apikey" },
    { id: "apikeyUse", phase: "source", kind: "exit", label: "AuthMode ApiKey", sub: "不開瀏覽器", snip: "gb-apikey" },
    { id: "cached", phase: "source", kind: "ask", label: "快取還沒過期？", snip: "gb-cached" },
    { id: "cachedUse", phase: "source", kind: "exit", label: "直接用這張票", sub: "flow.rs", snip: "gb-cached" },
    { id: "external", phase: "source", kind: "ask", label: "外部指令成功？", snip: "gb-external" },
    { id: "externalUse", phase: "source", kind: "exit", label: "別的程式交票", sub: "auth_provider_command", snip: "gb-external" },
    { id: "oidc", phase: "method", kind: "ask", label: "config 有 oidc？", snip: "gb-idp" },
    { id: "idp", phase: "method", kind: "exit", label: "那個 issuer 的 loopback", sub: "flow.rs", snip: "gb-idp" },
    { id: "device", phase: "method", kind: "ask", label: "要裝置碼嗎？", snip: "gb-device" },
    { id: "deviceUse", phase: "method", kind: "exit", label: "螢幕出碼再 poll", sub: "device_code.rs", snip: "gb-device" },
    { id: "bind", phase: "loopback", label: "綁 127.0.0.1 callback", sub: "oidc/login.rs", snip: "gb-bind" },
    { id: "url", phase: "loopback", label: "組 authorize URL", sub: "oidc/protocol.rs", snip: "gb-authorize" },
    { id: "exchange", phase: "loopback", label: "授權碼換票", sub: "oidc/protocol.rs", snip: "gb-exchange" },
    { id: "write", phase: "loopback", label: "寫入 AuthMode Oidc", sub: "oidc/protocol.rs", snip: "gb-write" },
    { id: "snapshot", phase: "loopback", label: "snapshot 給呼叫端", sub: "auth_provider.rs", snip: "gb-snapshot" },
  ],
  path: ["need", "apikey", "cached", "external", "oidc", "device", "bind", "url", "exchange", "write", "snapshot"],
  pathLabels: { apikey: "沒有", cached: "沒有", external: "沒有", oidc: "沒有", device: "預設不要" },
  branches: [
    { s: "apikey", t: "apikeyUse", label: "有" },
    { s: "cached", t: "cachedUse", label: "有" },
    { s: "external", t: "externalUse", label: "成功" },
    { s: "oidc", t: "idp", label: "有" },
    { s: "device", t: "deviceUse", label: "要" },
  ],
};

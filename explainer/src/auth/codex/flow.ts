import type { Flow } from "../../components/FlowDag";

export const AUTH_FLOW: Flow = {
  label: "Codex 怎麼拿到票",
  phases: [
    { id: "route", label: "1 選路" },
    { id: "browser", label: "2 瀏覽器登入" },
    { id: "read", label: "3 讀取" },
  ],
  steps: [
    { id: "cmd", phase: "route", label: "codex login", sub: "cli/src/main.rs", snip: "cx-dispatch" },
    { id: "flag", phase: "route", kind: "ask", label: "旗標是哪一種？", snip: "cx-dispatch" },
    { id: "both", phase: "route", kind: "exit", label: "兩種 stdin 同時", sub: "直接結束", snip: "cx-both" },
    { id: "legacy", phase: "route", kind: "exit", label: "舊的 --api-key", sub: "印停用後結束", snip: "cx-legacy" },
    { id: "apikey", phase: "route", kind: "exit", label: "--with-api-key", sub: "stdin 金鑰寫檔", snip: "cx-apikey" },
    { id: "device", phase: "route", kind: "exit", label: "--device-auth", sub: "device_code_auth.rs", snip: "cx-device" },
    { id: "pkce", phase: "browser", label: "本機產生 PKCE", sub: "oauth/pkce.rs", snip: "cx-pkce" },
    { id: "open", phase: "browser", label: "瀏覽器回 localhost", sub: "server.rs", snip: "cx-open" },
    { id: "exchange", phase: "browser", label: "授權碼換票", sub: "oauth/client.rs", snip: "cx-exchange" },
    { id: "file", phase: "browser", label: "寫入 auth.json", sub: "auth/storage.rs", snip: "cx-file" },
    { id: "env", phase: "read", kind: "ask", label: "讀取時有 CODEX_API_KEY？", snip: "cx-env" },
    { id: "memory", phase: "read", kind: "exit", label: "只放記憶體", sub: "不寫 auth.json", snip: "cx-env" },
    { id: "use", phase: "read", label: "用檔裡的票", sub: "auth/manager.rs", snip: "cx-save" },
  ],
  path: ["cmd", "flag", "pkce", "open", "exchange", "file", "env", "use"],
  pathLabels: { flag: "都沒有", env: "沒有" },
  branches: [
    { s: "flag", t: "both" },
    { s: "flag", t: "legacy" },
    { s: "flag", t: "apikey" },
    { s: "flag", t: "device" },
    { s: "env", t: "memory", label: "有" },
  ],
};

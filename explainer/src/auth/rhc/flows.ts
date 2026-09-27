import type { Flow } from "../../components/FlowDag";

/** `rhc login` from the command to the file, checked against commands.rs, oidc.rs, client.rs and store.rs. */
export const LOGIN_FLOW: Flow = {
  label: "rhc login 怎麼拿到票",
  phases: [
    { id: "prep", label: "1 準備" },
    { id: "authorize", label: "2 授權" },
    { id: "callback", label: "3 回呼" },
    { id: "exchange", label: "4 換票" },
    { id: "store", label: "5 存檔" },
  ],
  steps: [
    { id: "cmd", phase: "prep", who: "rhc", label: "rhc login", sub: "commands::login → AuthClient::login", snip: "loop" },
    { id: "fromGrok", phase: "prep", who: "rhc", kind: "ask", label: "有 --from-grok？", sub: "grok_import.rs", snip: "import" },
    { id: "import", phase: "prep", who: "rhc", kind: "exit", label: "抄 Grok 的 access token", sub: "grok_import.rs", snip: "import-session" },
    { id: "bind", phase: "prep", who: "本機 listener", label: "綁一個隨機 port", sub: "TcpListener::bind((\"127.0.0.1\", 0))", snip: "loop" },
    { id: "pkce", phase: "prep", who: "rhc", label: "產生 PKCE、state、nonce", sub: "generate_pkce · random_token", snip: "pkce" },
    { id: "url", phase: "authorize", who: "rhc", label: "組授權網址", sub: "authorize_url", snip: "url" },
    { id: "wait", phase: "authorize", who: "本機 listener", label: "開執行緒等 callback", sub: "accept_callback", snip: "callback" },
    { id: "open", phase: "authorize", who: "瀏覽器", label: "開瀏覽器", sub: "webbrowser::open", snip: "loop" },
    { id: "consent", phase: "authorize", who: "auth.x.ai", label: "你登入並同意", snip: "provider" },
    { id: "timeout", phase: "authorize", who: "本機 listener", kind: "fail", label: "超過 600 秒：失敗", sub: "accept_callback", snip: "callback" },
    { id: "redirect", phase: "callback", who: "瀏覽器", label: "轉回 /callback?code&state", snip: "callback" },
    { id: "isCallback", phase: "callback", who: "本機 listener", kind: "ask", label: "路徑是 /callback？", sub: "accept_callback", snip: "callback" },
    { id: "stateOk", phase: "callback", who: "本機 listener", kind: "ask", label: "state 對得上？", sub: "code_from_request_line", snip: "callback" },
    { id: "bad", phase: "callback", who: "本機 listener", kind: "fail", label: "回 400：失敗", sub: "code_from_request_line", snip: "callback" },
    { id: "exchange", phase: "exchange", who: "auth.x.ai", label: "用 code 換票", sub: "exchange_code", snip: "exchange" },
    { id: "ok200", phase: "exchange", who: "rhc", kind: "ask", label: "回 200？", sub: "exchange_code", snip: "exchange" },
    { id: "exFail", phase: "exchange", who: "rhc", kind: "fail", label: "換票失敗", sub: "error_message", snip: "exchange" },
    { id: "parse", phase: "exchange", who: "rhc", label: "讀出 token 與身分", sub: "grant_from_token_payload · claims_from_jwt", snip: "claims" },
    { id: "save", phase: "store", who: "~/.rhc/auth.json", label: "上鎖、寫檔", sub: "TokenStore::lock · TokenStore::save", snip: "save" },
    { id: "done", phase: "store", who: "rhc", label: "印出已登入", sub: "terminal::print_signed_in" },
  ],
  path: ["cmd", "fromGrok", "bind", "pkce", "url", "wait", "open", "consent", "redirect", "isCallback", "stateOk", "exchange", "ok200", "parse", "save", "done"],
  pathLabels: { fromGrok: "沒有", isCallback: "是", stateOk: "對", ok200: "是" },
  branches: [
    { s: "fromGrok", t: "import", label: "有" },
    { s: "wait", t: "timeout", label: "600 秒" },
    { s: "isCallback", t: "wait", label: "不是，回 404" },
    { s: "stateOk", t: "bad", label: "不對" },
    { s: "ok200", t: "exFail", label: "不是" },
  ],
};

/** `refresh_if_needed` from wanting a token to writing the new one back. */
export const REFRESH_FLOW: Flow = {
  label: "過期的票怎麼換新",
  phases: [
    { id: "check", label: "1 判斷" },
    { id: "lock", label: "2 上鎖" },
    { id: "grant", label: "3 換新" },
  ],
  steps: [
    { id: "need", phase: "check", label: "要用票", sub: "refresh_if_needed", snip: "refresh" },
    { id: "fresh", phase: "check", kind: "ask", label: "還沒過期？", snip: "fresh" },
    { id: "use", phase: "check", kind: "exit", label: "直接用", sub: "不上鎖", snip: "fresh" },
    { id: "lock", phase: "lock", label: "拿 auth.json.lock", sub: "flock", snip: "lock" },
    { id: "reread", phase: "lock", kind: "ask", label: "重讀後已是新票？", snip: "refresh" },
    { id: "others", phase: "lock", kind: "exit", label: "用別人換好的", sub: "不再 refresh", snip: "refresh" },
    { id: "grant", phase: "grant", label: "refresh_token 換新票", sub: "oauth2/token", snip: "refresh-grant" },
    { id: "revoked", phase: "grant", kind: "ask", label: "伺服器回 invalid_grant？", snip: "refresh-grant" },
    { id: "relogin", phase: "grant", kind: "fail", label: "刪檔，要求重登", sub: "RefreshRevoked", snip: "refresh" },
    { id: "save", phase: "grant", label: "寫回新票", sub: "store.rs", snip: "save" },
  ],
  path: ["need", "fresh", "lock", "reread", "grant", "revoked", "save"],
  pathLabels: { fresh: "過期", reread: "還是舊的", revoked: "否" },
  branches: [
    { s: "fresh", t: "use", label: "是" },
    { s: "reread", t: "others", label: "是" },
    { s: "revoked", t: "relogin", label: "是" },
  ],
};

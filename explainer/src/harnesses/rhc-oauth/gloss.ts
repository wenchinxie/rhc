export type GlossEntry = { t: string; d: string; avoid?: string[] };
export const GLOSS: Record<string, GlossEntry> = {
  pkce: {
    t: "PKCE",
    d: "本機產生隨機 verifier 留著，只把它的 SHA-256（code_challenge）送出去。換票時再送出 verifier，伺服器比對雜湊，擋掉半路偷到 code 的人。",
  },
  state: {
    t: "state",
    d: "隨機值，隨授權網址送出去。回呼帶回的 state 要對得上，對不上就登入失敗，擋偽造的回呼。",
  },
  nonce: {
    t: "nonce",
    d: "隨機值，隨授權網址送出去，理論上要在 id token 裡核對。rhc 目前不檢查這個值。",
  },
  loopback: {
    t: "loopback",
    d: "在本機 127.0.0.1 開一個暫時的埠等瀏覽器把授權碼送回來，不必自己開一個常駐伺服器。",
  },
  "device-code": {
    t: "device code",
    d: "RFC 8628 定義的登入方式：畫面印一組代碼，使用者在另一台裝置的網頁上輸入，程式在背景輪詢結果。",
  },
  "refresh-token": {
    t: "refresh token",
    d: "用來換新 access token 的長效憑證，不用每次都重新走一次瀏覽器登入。",
  },
  "access-token": {
    t: "access token",
    d: "打 API 時放進 Authorization 標頭的短效憑證。",
  },
  "id-token": {
    t: "id token",
    d: "OIDC 額外給的 JWT，帶使用者身分（sub、email 等 claim）。",
  },
  flock: {
    t: "flock",
    d: "作業系統提供的建議性（advisory）排他檔案鎖。只有同樣先去拿鎖的行程會排隊等，rhc 每次寫 auth.json 前都先拿。",
  },
  "atomic-rename": {
    t: "atomic rename",
    d: "先把新內容寫進暫存檔、fsync，再用改名蓋過舊檔；改名這個動作本身不會被切一半，所以中途當機也不會留下壞掉的檔案。",
  },
  referrer: {
    t: "referrer",
    d: "授權網址上的一個欄位，告訴 xAI 是哪個程式在發起登入。",
  },
  scope: {
    t: "scope",
    d: "OAuth 要求的權限清單，寫在授權網址裡，決定拿到的票能做哪些事。",
  },
};

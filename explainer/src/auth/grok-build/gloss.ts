export type GlossEntry = { t: string; d: string; avoid?: string[] };

export const GLOSS: Record<string, GlossEntry> = {
  "auth-port": {
    t: "Auth 合約",
    d: "別人只問現在會送出去的 bearer。Grok Build 叫 AuthCredentialProvider.snapshot。",
    avoid: [],
  },
  snapshot: {
    t: "snapshot",
    d: "此刻會放進 Authorization 的那張票，加上 subject 與 email。讀它不再跑登入。",
  },
};

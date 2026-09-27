export type GlossEntry = { t: string; d: string; avoid?: string[] };
export const GLOSS: Record<string, GlossEntry> = {
  pkce: {
    t: "PKCE",
    d: "瀏覽器只拿到 challenge。verifier 留在本機，換票時才送出。Codex 的 localhost 自己產生。device-code 的 verifier 來自輪詢回應。",
  },
};

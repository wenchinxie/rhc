export type GlossEntry = { t: string; d: string; avoid?: string[] };

export const GLOSS: Record<string, GlossEntry> = {
  pstack: {
    t: "Pstack",
    d: "Lauren Tan 公開的 Cursor 外掛。P 是 potato，故意對 Gary Tan 的 G-stack 開玩笑。裡面有建立／維護驗證技能、評測劇本。她在自家程式庫叫 /lauren-mode，外掛裡叫 /poteto-mode。",
    avoid: [],
  },
  dune: {
    t: "Dune",
    d: "Lauren Tan 給 Grok Bot 那套架構取的內部代號。她說可以想成給 Electron 桌面程式用的 Next.js，專門讓 agent 寫。持續整合禁止 useEffect，也禁止大多數註解。",
    avoid: [],
  },
  glass: {
    t: "Glass",
    d: "Cursor 內部對 Agent Window（代理人視窗）的代號。Lauren Tan 進公司第一週幫這塊趕上線，第一個技能叫 control glass：讓 agent 用 Chrome DevTools 協定把視窗跑起來、抓效能追蹤。",
    avoid: [],
  },
  "feature-map": {
    t: "功能地圖",
    d: "一份清單，寫畫面上每個功能怎麼走到、鍵盤捷徑、以及用瀏覽器除錯協定點選時要對的網頁元素屬性。沒有它，agent 能開開發版，但找不到側欄或 PR 分頁。",
    avoid: [],
  },
  benny: {
    t: "Benny",
    d: "Lauren Tan 做的一隻常駐機器人，頭像是小狗。接到錯誤回報就在雲端桌面打開 Cursor，用同一套驗證技能重現問題。Grok Bot 後來把「每人一隻有自己電腦與例行工作的機器人」做成產品。",
    avoid: [],
  },
};

export type GlossEntry = { t: string; d: string; avoid?: string[] };

export const GLOSS: Record<string, GlossEntry> = {
  coordinator: {
    t: "coordinator",
    d: "桌面程式生出來的中介行程（服務名 sand-node-agent-coordinator）。視窗把使用者的送出交給它；它再連到跟筆電分開、用來跑命令的那台遠端機器，把送出轉給那裡負責接送出的行程。",
    avoid: ["控制面行程"],
  },
  "sand-host": {
    t: "host-main",
    d: "在跟筆電分開、用來跑命令的那台遠端機器裡，負責接下使用者送出、一步步呼叫模型與工具直到這則送出結束的那個行程。開機時先搶鎖檔 host.lock，再起代跑命令的服務，再起給桌面連線用的 HTTP 入口。程式檔是 host/main.ts。",
    avoid: ["sand-host"],
  },
  box: {
    t: "沙箱機器",
    d: "出廠預設由 Cursor 後端配給的一台遠端電腦，用來跑命令與放檔案，跟使用者自己的筆電分開。程式裡叫 box；這份原始碼複製也可改連使用者筆電上另開的隔離環境（容器）。",
    avoid: [],
  },
  "send-pipeline": {
    t: "SendPipeline",
    d: "遠端機器上那個接送出的行程，接受「送出」請求時走的路：先給這則送出一個編號，同一個編號若還在處理就併進那次；寫下使用者剛送出的那行文字，再排隊讓模型再答一回合。",
    avoid: [],
  },
  reconstruction: {
    t: "重建疊層",
    d: "這份原始碼複製加在出廠行為上面的東西：可改走 Claude Code／Codex／OpenRouter，以及改連使用者筆電上另開的隔離環境（容器）。出廠沒改設定時，模型來源仍是 Cursor，機器仍是遠端那台。",
    avoid: ["重建稿疊層"],
  },
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

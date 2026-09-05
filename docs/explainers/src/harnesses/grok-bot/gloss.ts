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
  "report-pipe": {
    t: "report pipe",
    d: "每種遙測回報各一支的驗證閘：先用 isValid 檢查形狀，過了才呼叫對應的送法；沒有中間佇列，驗證沒過就當場結束，不會半成品往下傳。IPC channel 表把 channel 名對到 pipe 名，缺一個就在啟動時丟錯。",
    avoid: [],
  },
  "buffered-transport": {
    t: "BufferedTransport",
    d: "結構化日誌那一路專屬的記憶體佇列：送不出就整批留著、只丟掉壞掉的 client 重建連線；佇列滿了才真的砍資料，砍最舊的那幾筆。掉線時把佇列內容寫成 spill 檔留在本機，帳號恢復連線或程式重開再讀回來續傳。其餘分流（Sentry、協調器聚合轉送前、產品分析）都沒有這層佇列，送不出就跳過。",
    avoid: [],
  },
};

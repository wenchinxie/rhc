import { MDXProvider } from "@mdx-js/react";
import { ExplainerShell } from "../../ExplainerShell";
import { mdxComponents } from "../../mdx-components";
import { GLOSS } from "./gloss";
import srcMap from "./src-map.json";
import Doc from "./page.mdx";

const TOC = [
  {
    href: "#s0",
    n: "0",
    label: "資料夾地圖",
    children: [
      { href: "#s0-1", n: "0.1", label: "每個資料夾歸哪一章" },
      { href: "#s0-2", n: "0.2", label: "行程拓樸總覽" },
    ],
  },
  {
    href: "#s1",
    n: "1",
    label: "重建稿，不是出廠殼",
    children: [
      { href: "#s1-1", n: "1.1", label: "邊界釘在出廠安裝包" },
      { href: "#s1-2", n: "1.2", label: "疊層的三個記號" },
      { href: "#s1-3", n: "1.3", label: "六個行程根各管一段" },
      { href: "#s1-4", n: "1.4", label: "frontend/ 是可讀重建" },
      { href: "#s1-5", n: "1.5", label: "核對回原始碼" },
      { href: "#s1-6", n: "1.6", label: "三種資料夾：extension、packages、shared" },
    ],
  },
  {
    href: "#s2",
    n: "2",
    label: "開機沒有主行程管到底",
    children: [
      { href: "#s2-1", n: "2.1", label: "主行程只起殼" },
      { href: "#s2-2", n: "2.2", label: "畫面靠 preload 轉手" },
      { href: "#s2-3", n: "2.3", label: "host-main 開機三步" },
      { href: "#s2-4", n: "2.4", label: "box-exec-daemon 是 host 生的" },
      { href: "#s2-5", n: "2.5", label: "coordinator 的兩個 loopback" },
    ],
  },
  {
    href: "#s3",
    n: "3",
    label: "上限五千，那個一千沒人讀",
    children: [
      { href: "#s3-1", n: "3.1", label: "SendPipeline 收斂重複" },
      { href: "#s3-2", n: "3.2", label: "十二種動作之一" },
      { href: "#s3-3", n: "3.3", label: "外層五千步，內層輪流" },
      { href: "#s3-4", n: "3.4", label: "沒有工具呼叫才結束" },
      { href: "#s3-5", n: "3.5", label: "TranscriptManager 的插座板" },
    ],
  },
  {
    href: "#s4",
    n: "4",
    label: "出廠只認 Cursor",
    children: [
      { href: "#s4-1", n: "4.1", label: "預設值在讀設定那一行" },
      { href: "#s4-2", n: "4.2", label: "三條重建線與憑證" },
      { href: "#s4-3", n: "4.3", label: "路由判斷分兩層" },
      { href: "#s4-4", n: "4.4", label: "四條線路一張表" },
    ],
  },
  {
    href: "#s5",
    n: "5",
    label: "工具要闖四道關卡",
    children: [
      { href: "#s5-1", n: "5.1", label: "登錄表與每輪重組" },
      { href: "#s5-2", n: "5.2", label: "七個 surface 各自審查" },
      { href: "#s5-3", n: "5.3", label: "待審核阻擋副作用" },
      { href: "#s5-4", n: "5.4", label: "預檢與三層權限" },
      { href: "#s5-5", n: "5.5", label: "遠端殼與本機殼" },
    ],
  },
  {
    href: "#s6",
    n: "6",
    label: "沙箱在遠端，其餘是後補",
    children: [
      { href: "#s6-1", n: "6.1", label: "遠端通道靠後端要機器" },
      { href: "#s6-2", n: "6.2", label: "本機 Docker 是疊層" },
      { href: "#s6-3", n: "6.3", label: "local-exec 不算沙箱" },
      { href: "#s6-4", n: "6.4", label: "選擇點只有一個開關" },
    ],
  },
  {
    href: "#s7",
    n: "7",
    label: "設定共用，記憶跟秘密各自收",
    children: [
      { href: "#s7-1", n: "7.1", label: "根目錄先問環境變數" },
      { href: "#s7-2", n: "7.2", label: "settings.json 全域共用" },
      { href: "#s7-3", n: "7.3", label: "一個 agent 一個資料夾" },
      { href: "#s7-4", n: "7.4", label: "記憶兩層與凍結" },
      { href: "#s7-5", n: "7.5", label: "secrets 三層原子寫" },
    ],
  },
  {
    href: "#s8",
    n: "8",
    label: "遙測管線：從 emit 到落地",
    children: [
      { href: "#s8-1", n: "8.1", label: "事件目錄" },
      { href: "#s8-2", n: "8.2", label: "host-turn" },
      { href: "#s8-3", n: "8.3", label: "desktop-log" },
      { href: "#s8-4", n: "8.4", label: "中介行程聚合" },
      { href: "#s8-5", n: "8.5", label: "送出追蹤節流" },
      { href: "#s8-6", n: "8.6", label: "功能模組緩衝" },
      { href: "#s8-7", n: "8.7", label: "Sentry 直送" },
      { href: "#s8-8", n: "8.8", label: "產品分析" },
      { href: "#s8-9", n: "8.9", label: "接線總表" },
    ],
  },
  {
    href: "#s9",
    n: "9",
    label: "插座清單與狀態字彙",
    children: [
      { href: "#s9-1", n: "9.1", label: "host 的七個 port 檔" },
      { href: "#s9-2", n: "9.2", label: "桌面行程的 port" },
      { href: "#s9-3", n: "9.3", label: "狀態字彙的三個家" },
      { href: "#s9-4", n: "9.4", label: "沒有收攏的字彙" },
      { href: "#s9-5", n: "9.5", label: "怎麼讀" },
    ],
  },
  {
    href: "#s10",
    n: "10",
    label: "觀測了什麼：事件與欄位總表",
    children: [
      { href: "#s10-0", n: "10.0", label: "信封與共用欄位組" },
      { href: "#s10-1", n: "10.1", label: "turn" },
      { href: "#s10-2", n: "10.2", label: "tool_call 與子代理" },
      { href: "#s10-3", n: "10.3", label: "agent 錯誤" },
      { href: "#s10-4", n: "10.4", label: "訊息、佇列、送達" },
      { href: "#s10-5", n: "10.5", label: "修復" },
      { href: "#s10-6", n: "10.6", label: "遠端機器" },
      { href: "#s10-7", n: "10.7", label: "host 行程" },
      { href: "#s10-8", n: "10.8", label: "session 與狀態" },
      { href: "#s10-9", n: "10.9", label: "排程自動化" },
      { href: "#s10-10", n: "10.10", label: "整合與憑證" },
      { href: "#s10-12", n: "10.12", label: "產品分析" },
      { href: "#s10-13", n: "10.13", label: "桌面行程的事件" },
      { href: "#s10-14", n: "10.14", label: "前端的回報" },
      { href: "#s10-15", n: "10.15", label: "metrics 全表" },
      { href: "#s10-16", n: "10.16", label: "packages 的日誌" },
      { href: "#s10-17", n: "10.17", label: "span" },
      { href: "#s10-18", n: "10.18", label: "Sentry" },
      { href: "#s10-19", n: "10.19", label: "沒有落點的資料夾" },
    ],
  },
];

const SRC_MAP_JSON = JSON.stringify(srcMap).replace(/</g, "\\u003c");

export function GrokBotPage() {
  return (
    <ExplainerShell
      title="Grok Bot 0.18 設計邏輯"
      subtitle="照執行期問題切章，不照資料夾；每章一棵呼叫樹"
      kicker="grok-bot 0.18"
      mastNote="原始碼重建稿 grok-bot-0.18-reconstructed，commit a9f633e（Anysphere 出廠 0.18.0）；圖由 TypeScript 編譯器 API 抽出"
      toc={TOC}
      gloss={GLOSS}
      srcMapJson={SRC_MAP_JSON}
      railNote={
        <p>
          <b>重建稿</b> <code>grok-bot-0.18-reconstructed</code>
          <br />
          a9f633e · 產品 0.18.0 · 1,722 檔 · 41 個資料夾節點
        </p>
      }
    >
      <MDXProvider components={mdxComponents}>
        <Doc />
      </MDXProvider>
    </ExplainerShell>
  );
}

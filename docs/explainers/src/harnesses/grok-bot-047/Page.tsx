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
    label: "語料",
    children: [
      { href: "#s0-1", n: "0.1", label: "語料分五塊" },
      { href: "#s0-2", n: "0.2", label: "行程拓樸總覽" },
    ],
  },
  {
    href: "#s1",
    n: "1",
    label: "這份樹",
    children: [
      { href: "#s1-k", n: "1.0", label: "關鍵概念" },
      { href: "#s1-1", n: "1.1", label: "先看前綴與標記" },
      { href: "#s1-2", n: "1.2", label: "extracted 與 readable-ts 是 asar" },
      { href: "#s1-3", n: "1.3", label: "source/host 是 VM zip" },
      { href: "#s1-4", n: "1.4", label: "leftover 長怎樣" },
      { href: "#s1-5", n: "1.5", label: "東西在哪" },
      { href: "#s1-6", n: "1.6", label: "容易踩的" },
    ],
  },
  {
    href: "#s2",
    n: "2",
    label: "開機與行程",
    children: [
      { href: "#s2-k", n: "2.0", label: "關鍵概念" },
      { href: "#s2-1", n: "2.1", label: "主行程只起殼" },
      { href: "#s2-2", n: "2.2", label: "畫面靠 preload 轉手" },
      { href: "#s2-3", n: "2.3", label: "host-main 在 box 內 listen" },
      { href: "#s2-4", n: "2.4", label: "box-exec 不在這份 asar" },
      { href: "#s2-5", n: "2.5", label: "coordinator 三條 MessagePort" },
      { href: "#s2-6", n: "2.6", label: "東西在哪" },
      { href: "#s2-7", n: "2.7", label: "容易踩的" },
    ],
  },
  {
    href: "#s3",
    n: "3",
    label: "送出與回合",
    children: [
      { href: "#s3-k", n: "3.0", label: "關鍵概念" },
      { href: "#s3-1", n: "3.1", label: "SendPipeline 收斂重複" },
      { href: "#s3-2", n: "3.2", label: "接受之後才派工" },
      { href: "#s3-3", n: "3.3", label: "外層五千步在 agent dump" },
      { href: "#s3-4", n: "3.4", label: "沒有 SendToUser 就還沒送到人" },
      { href: "#s3-5", n: "3.5", label: "TranscriptManager 的插座" },
      { href: "#s3-6", n: "3.6", label: "東西在哪" },
      { href: "#s3-7", n: "3.7", label: "容易踩的" },
    ],
  },
  {
    href: "#s4",
    n: "4",
    label: "推論",
    children: [
      { href: "#s4-k", n: "4.0", label: "關鍵概念" },
      { href: "#s4-1", n: "4.1", label: "預設值在 resolveSandRequestedModel" },
      { href: "#s4-2", n: "4.2", label: "0.18 分流是 stub" },
      { href: "#s4-3", n: "4.3", label: "最後 hop 是 Cursor Stream" },
      { href: "#s4-4", n: "4.4", label: "憑證不在桌面 login 檔" },
      { href: "#s4-5", n: "4.5", label: "東西在哪" },
      { href: "#s4-6", n: "4.6", label: "容易踩的" },
    ],
  },
  {
    href: "#s5",
    n: "5",
    label: "工具",
    children: [
      { href: "#s5-k", n: "5.0", label: "關鍵概念" },
      { href: "#s5-1", n: "5.1", label: "工具表決定看不看得到" },
      { href: "#s5-2", n: "5.2", label: "auto-review 只在 enforce 擋" },
      { href: "#s5-3", n: "5.3", label: "local-tool 只擋 machineId" },
      { href: "#s5-4", n: "5.4", label: "hooks 與 denylist" },
      { href: "#s5-5", n: "5.5", label: "真 spawn 在 shell-exec" },
      { href: "#s5-6", n: "5.6", label: "東西在哪" },
      { href: "#s5-7", n: "5.7", label: "容易踩的" },
    ],
  },
  {
    href: "#s6",
    n: "6",
    label: "沙箱與執行",
    children: [
      { href: "#s6-k", n: "6.0", label: "關鍵概念" },
      { href: "#s6-1", n: "6.1", label: "遠端通道靠後端要機器" },
      { href: "#s6-2", n: "6.2", label: "本機 Docker 只包 recreate" },
      { href: "#s6-3", n: "6.3", label: "local-exec 要 machineId" },
      { href: "#s6-4", n: "6.4", label: "選擇點在 connector 與工具參數" },
      { href: "#s6-5", n: "6.5", label: "東西在哪" },
      { href: "#s6-6", n: "6.6", label: "容易踩的" },
    ],
  },
  {
    href: "#s7",
    n: "7",
    label: "狀態",
    children: [
      { href: "#s7-k", n: "7.0", label: "關鍵概念" },
      { href: "#s7-1", n: "7.1", label: "根目錄先問環境變數" },
      { href: "#s7-2", n: "7.2", label: "settings.json 在 sand root" },
      { href: "#s7-3", n: "7.3", label: "一個 agent 一個資料夾" },
      { href: "#s7-4", n: "7.4", label: "記憶是檔案不是 SQLite" },
      { href: "#s7-5", n: "7.5", label: "secrets 分兩棵樹" },
      { href: "#s7-6", n: "7.6", label: "東西在哪" },
      { href: "#s7-7", n: "7.7", label: "容易踩的" },
    ],
  },
  {
    href: "#s8",
    n: "8",
    label: "觀測",
    children: [
      { href: "#s10-0", n: "8.1", label: "信封與共用欄位組" },
      { href: "#s10-1", n: "8.2", label: "turn" },
      { href: "#s10-2", n: "8.3", label: "tool_call 與子代理" },
      { href: "#s10-3", n: "8.4", label: "agent 錯誤" },
      { href: "#s10-4", n: "8.5", label: "訊息、佇列、送達" },
      { href: "#s10-5", n: "8.6", label: "修復" },
      { href: "#s10-6", n: "8.7", label: "遠端機器" },
      { href: "#s10-7", n: "8.8", label: "host 行程" },
      { href: "#s10-8", n: "8.9", label: "session 與狀態" },
      { href: "#s10-9", n: "8.10", label: "排程自動化" },
      { href: "#s10-10", n: "8.11", label: "整合與憑證" },
      { href: "#s10-12", n: "8.12", label: "產品分析" },
      { href: "#s10-13", n: "8.13", label: "桌面行程的事件" },
      { href: "#s10-14", n: "8.14", label: "前端的回報" },
      { href: "#s10-15", n: "8.15", label: "metrics 全表" },
      { href: "#s10-16", n: "8.16", label: "packages 的日誌" },
      { href: "#s10-17", n: "8.17", label: "span" },
      { href: "#s10-18", n: "8.18", label: "Sentry" },
      { href: "#s10-19", n: "8.19", label: "沒有落點的資料夾" },
      { href: "#s8-pipe", n: "8.20", label: "怎麼送到落點" },
      { href: "#s8-1", n: "8.21", label: "事件目錄" },
      { href: "#s8-2", n: "8.22", label: "host-turn" },
      { href: "#s8-3", n: "8.23", label: "desktop-log" },
      { href: "#s8-4", n: "8.24", label: "中介行程聚合" },
      { href: "#s8-5", n: "8.25", label: "送出追蹤節流" },
      { href: "#s8-6", n: "8.26", label: "功能模組緩衝" },
      { href: "#s8-7", n: "8.27", label: "Sentry 直送" },
      { href: "#s8-8", n: "8.28", label: "產品分析落地" },
      { href: "#s8-9", n: "8.29", label: "接線總表" },
    ],
  },
  {
    href: "#s9",
    n: "9",
    label: "port 與跨行程",
    children: [
      { href: "#s9-1", n: "9.1", label: "host/ports 收回兩檔" },
      { href: "#s9-2", n: "9.2", label: "noop 先插再換" },
      { href: "#s9-3", n: "9.3", label: "筆電 dune-rpc 與 leftover" },
      { href: "#s9-4", n: "9.4", label: "缺了的 telemetry.ts" },
      { href: "#s9-5", n: "9.5", label: "怎麼讀" },
    ],
  },
];

const SRC_MAP_JSON = JSON.stringify(srcMap).replace(/</g, "\\u003c");

export function GrokBotPage() {
  return (
    <ExplainerShell
      title="Grok Bot 0.47 設計邏輯"
      subtitle="先說這個產品做什麼，圖上是行程與機器"
      kicker="grok-bot 0.47"
      mastNote="0.47.0 Windows asar 反編譯稿 grok-bot-0.47-reconstructed；host 來自 VM zip cb0ed63，不是這份筆電 asar"
      toc={TOC}
      gloss={GLOSS}
      srcMapJson={SRC_MAP_JSON}
      railNote={
        <p>
          <b>反編譯稿</b> <code>grok-bot-0.47-reconstructed</code>
          <br />
          產品 0.47.0 · sandTrack stable · host cb0ed63
        </p>
      }
    >
      <MDXProvider components={mdxComponents}>
        <Doc />
      </MDXProvider>
    </ExplainerShell>
  );
}

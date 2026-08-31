import { MDXProvider } from "@mdx-js/react";
import { ExplainerShell } from "../../ExplainerShell";
import { mdxComponents } from "../../mdx-components";
import { GLOSS } from "./gloss";
import srcMap from "./src-map.json";
import Doc from "./page.mdx";

const TOC = [
  { href: "#s0", n: "0", label: "七塊職責總覽" },
  { href: "#s1", n: "1", label: "重建稿，不是官方整包源碼" },
  { href: "#s2", n: "2", label: "三行程，host 在遠端機器" },
  { href: "#s3", n: "3", label: "預設送出走 Cursor" },
  { href: "#s4", n: "4", label: "遠端與本機兩路命令" },
  { href: "#s5", n: "5", label: "遠端機器是出廠預設" },
  { href: "#s6", n: "6", label: "路由器與本機容器是疊層" },
  {
    href: "#s7",
    n: "7",
    label: "Lauren Tan 工作坊",
    children: [
      { href: "#s7-0", n: "7.0", label: "AI 是配對寫程式的人" },
      { href: "#s7-1", n: "7.1", label: "驗證是讓 agent 跑真程式" },
      { href: "#s7-2", n: "7.2", label: "Glass、功能地圖、Pstack" },
      { href: "#s7-3", n: "7.3", label: "how 技能與評測" },
      { href: "#s7-4", n: "7.4", label: "主廚、Benny、信任階梯" },
      { href: "#s7-5", n: "7.5", label: "重寫、Dune、護欄進 CI" },
      { href: "#s7-6", n: "7.6", label: "用量、Grok 4.6、非工程也出碼" },
      { href: "#s7-7", n: "7.7", label: "延長問答、演示、傳訊" },
    ],
  },
];

const SRC_MAP_JSON = JSON.stringify(srcMap).replace(/</g, "\\u003c");

export function GrokBotPage() {
  return (
    <ExplainerShell
      title="Grok Bot 0.18 設計邏輯"
      subtitle="一則使用者送出，要沿時間順序讀過哪些關"
      kicker="grok-bot 0.18"
      mastNote="原始碼複製 /mnt/e/grok-bot-0.18-reconstructed（Anysphere 出廠 0.18.0 的重建稿）"
      toc={TOC}
      gloss={GLOSS}
      srcMapJson={SRC_MAP_JSON}
      railNote={
        <p>
          <b>複製</b> <code>/mnt/e/grok-bot-0.18-reconstructed</code>
          <br />
          a9f633e · 產品 0.18.0 · 讀碼日 2026-08-29
        </p>
      }
    >
      <MDXProvider components={mdxComponents}>
        <Doc />
      </MDXProvider>
    </ExplainerShell>
  );
}

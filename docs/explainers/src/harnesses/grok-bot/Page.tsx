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
    label: "Lauren Tan 工作坊：分類與全稿",
    children: [
      { href: "#s7-cats", n: "7.0", label: "依時間切的八塊" },
      { href: "#s7-full", n: "7.1", label: "全稿 00:00 到 72:04" },
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

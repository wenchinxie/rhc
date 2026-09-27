import { MDXProvider } from "@mdx-js/react";
import { ExplainerShell } from "../../ExplainerShell";
import { mdxComponents } from "../../mdx-components";
import { GLOSS as GLOSS_018 } from "./gloss";
import { GLOSS as GLOSS_047 } from "../grok-bot-047/gloss";
import srcMap018 from "./src-map.json";
import srcMap047 from "../grok-bot-047/src-map.json";
import { TOC as Toc047 } from "../grok-bot-047/Page";
import Doc from "./page.mdx";

export const GLOSS = { ...GLOSS_018, ...GLOSS_047 };
export const SRC_MAP = { ...srcMap018, ...srcMap047 };
const srcMap = SRC_MAP;

export const TOC = [
  ...Toc047.filter((t) => t.href !== "#s-auth"),
  {
    href: "#s11",
    n: "11",
    label: "Skill 怎麼進到模型",
    children: [
      { href: "#s11-1", n: "11.1", label: "四種來源一張清單" },
      { href: "#s11-2", n: "11.2", label: "模型自選去 Read" },
      { href: "#s11-3", n: "11.3", label: "人工附加與注入" },
      { href: "#s11-4", n: "11.4", label: "開關只接兩種來源" },
      { href: "#s11-5", n: "11.5", label: "對照 Lauren" },
    ],
  },
  {
    href: "#s-auth",
    n: "12",
    label: "Auth",
    children: [
      { href: "#s-auth-1", n: "12.1", label: "關鍵概念" },
      { href: "#s-auth-2", n: "12.2", label: "怎麼走" },
      { href: "#s-auth-3", n: "12.3", label: "東西在哪" },
      { href: "#s-auth-4", n: "12.4", label: "容易踩的" },
    ],
  },
];

const SRC_MAP_JSON = JSON.stringify(srcMap).replace(/</g, "\\u003c");

export function GrokBotPage() {
  return (
    <ExplainerShell
      title="Grok Bot 設計邏輯"
      subtitle="0.18 的章切，填 0.47 的碼。Skill 章是 0.18 還有、0.47 樹沒單獨立的那格。"
      kicker="grok-bot"
      mastNote="章骨架沿 0.18。正文是 0.47 Windows asar 加 VM host cb0ed63。Auth 與決策樹用 0.47。"
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

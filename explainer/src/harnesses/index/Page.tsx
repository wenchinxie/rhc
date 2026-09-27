import { MDXProvider } from "@mdx-js/react";
import { ExplainerShell } from "../../ExplainerShell";
import { mdxComponents } from "../../mdx-components";
import Doc from "./page.mdx";

const TOC = [
  {
    href: "#s1",
    n: "1",
    label: "Grok Bot",
    children: [
      { href: "#s1-1", n: "1.1", label: "0.18 重建稿" },
      { href: "#s1-2", n: "1.2", label: "0.47 反編譯稿" },
      { href: "#s1-3", n: "1.3", label: "0.18 到 0.47" },
      { href: "#s1-4", n: "1.4", label: "兩條拿票的路" },
    ],
  },
  {
    href: "#s2",
    n: "2",
    label: "工作坊",
    children: [
      { href: "#s2-1", n: "2.1", label: "SpaceXAI 工作者怎麼 vibe code" },
      { href: "#s2-2", n: "2.2", label: "How a SpaceXAI worker vibe codes" },
    ],
  },
];

export function IndexPage() {
  return (
    <ExplainerShell
      title="Explainers"
      subtitle="一份 bun。每份文件一個 harness。"
      kicker="catalog"
      mastNote="象牙殼與左側目錄跟 Grok Bot 各頁同一套 CSS。"
      toc={TOC}
      gloss={{}}
      srcMapJson="{}"
    >
      <MDXProvider components={mdxComponents}>
        <Doc />
      </MDXProvider>
    </ExplainerShell>
  );
}

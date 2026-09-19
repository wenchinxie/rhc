import { MDXProvider } from "@mdx-js/react";
import { ExplainerShell } from "../../ExplainerShell";
import { mdxComponents } from "../../mdx-components";
import Doc from "./page.mdx";

const TOC = [
  {
    href: "#e0",
    n: "0",
    label: "0.18 到 0.47",
    children: [
      { href: "#e0-1", n: "0.1", label: "還一樣" },
      { href: "#e0-2", n: "0.2", label: "改了" },
      { href: "#e0-3", n: "0.3", label: "0.47 這份樹沒有" },
      { href: "#e0-4", n: "0.4", label: "怎麼讀這兩份" },
    ],
  },
];

export function EvolutionPage() {
  return (
    <ExplainerShell
      title="Grok Bot 0.18 到 0.47"
      subtitle="同一產品，兩份 bytes"
      kicker="evolution"
      mastNote="0.18 是重建稿。0.47 是 asar 反編譯稿加 VM host。"
      toc={TOC}
      gloss={{}}
      srcMapJson="{}"
      railNote={
        <p>
          <b>0.18</b> <code>a9f633e</code>
          <br />
          <b>0.47</b> 產品 0.47.0 · host <code>cb0ed63</code>
        </p>
      }
    >
      <MDXProvider components={mdxComponents}>
        <Doc />
      </MDXProvider>
    </ExplainerShell>
  );
}

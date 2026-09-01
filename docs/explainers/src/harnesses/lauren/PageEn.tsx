import { MDXProvider } from "@mdx-js/react";
import { ExplainerShell } from "../../ExplainerShell";
import { mdxComponents } from "../../mdx-components";
import { GLOSS } from "./gloss";
import copy from "./copy.en.json";
import srcMap from "./src-map.json";
import Doc from "./page-en.mdx";

const TOC = [
  { href: "#video", label: copy.labels.video },
  ...copy.blocks.map((b) => ({
    href: `#${b.id}`,
    n: b.n,
    label: b.title,
  })),
  { href: "#plugin", label: copy.labels.plugin },
];

const SRC_MAP_JSON = JSON.stringify(srcMap).replace(/</g, "\\u003c");

export function LaurenPageEn() {
  return (
    <ExplainerShell
      title={copy.title}
      subtitle={copy.subtitle}
      kicker={copy.kicker}
      mastNote={copy.mastNote}
      toc={TOC}
      gloss={GLOSS}
      srcMapJson={SRC_MAP_JSON}
      railNote={
        <p>
          <b>Pstack</b>
          <br />
          <a className="xref" href={copy.plugin.url}>
            github.com/cursor/plugins/tree/main/pstack
          </a>
        </p>
      }
    >
      <MDXProvider components={mdxComponents}>
        <Doc />
      </MDXProvider>
    </ExplainerShell>
  );
}

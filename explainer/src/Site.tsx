import { useLayoutEffect, useRef, type ReactNode } from "react";
import { MDXProvider } from "@mdx-js/react";
import { ExplainerShell } from "./ExplainerShell";
import { mdxComponents } from "./mdx-components";
import SiteApex from "./harnesses/index/page.mdx";
import Grok018Doc from "./harnesses/grok-bot/page.mdx";
import {
  GLOSS as grok018Gloss,
  SRC_MAP as grok018Src,
} from "./harnesses/grok-bot/Page";
import { FOLDER_TOC as grok018Toc } from "./harnesses/grok-bot/catalog-toc";
import CodexDoc from "./harnesses/codex/page.mdx";
import { GLOSS as codexGloss } from "./harnesses/codex/gloss";
import codexSrc from "./harnesses/codex/src-map.json";
import { FOLDER_TOC as codexToc } from "./harnesses/codex/catalog-toc";
import ClaudeDoc from "./harnesses/claude/page.mdx";
import { GLOSS as claudeGloss } from "./harnesses/claude/gloss";
import claudeSrc from "./harnesses/claude/src-map.json";
import { FOLDER_TOC as claudeToc } from "./harnesses/claude/catalog-toc";
import GrokBuildDoc from "./harnesses/grok-build/page.mdx";
import { GLOSS as grokBuildGloss } from "./harnesses/grok-build/gloss";
import grokBuildSrc from "./harnesses/grok-build/src-map.json";
import { FOLDER_TOC as grokBuildToc } from "./harnesses/grok-build/catalog-toc";
import RhcDoc from "./harnesses/rhc/page.mdx";
import { GLOSS as rhcGloss } from "./harnesses/rhc/gloss";
import rhcSrc from "./harnesses/rhc/src-map.json";
import { FOLDER_TOC as rhcToc } from "./harnesses/rhc/catalog-toc";
import RhcOAuthDoc from "./harnesses/rhc-oauth/page.mdx";
import { GLOSS as rhcOAuthGloss } from "./harnesses/rhc-oauth/gloss";
import rhcOAuthSrc from "./harnesses/rhc-oauth/src-map.json";
import { FOLDER_TOC as rhcOAuthToc } from "./harnesses/rhc-oauth/catalog-toc";

type GlossEntry = { t: string; d: string; avoid?: string[] };

type TocLink = {
  href: string;
  n?: string;
  label: string;
  children?: TocLink[];
};

type Folder = {
  slug: string;
  label: string;
  toc: TocLink[];
  gloss: Record<string, GlossEntry>;
  srcMap: Record<string, unknown>;
  Doc: () => ReactNode;
};

type Tool = {
  slug: string;
  label: string;
  parts: Folder[];
};

function prefixHash(slug: string, href: string): string {
  if (!href.startsWith("#")) {
    return href;
  }
  return `#${slug}-${href.slice(1)}`;
}

function prefixToc(slug: string, toc: TocLink[]): TocLink[] {
  return toc.map((item) => ({
    ...item,
    href: prefixHash(slug, item.href),
    children: item.children ? prefixToc(slug, item.children) : undefined,
  }));
}

function prefixRecord<T>(slug: string, rec: Record<string, T>): Record<string, T> {
  const out: Record<string, T> = {};
  for (const [key, value] of Object.entries(rec)) {
    out[`${slug}-${key}`] = value;
  }
  return out;
}

function FolderDoc(props: { slug: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) {
      return;
    }
    const prefix = `${props.slug}-`;
    root.querySelectorAll("[id]").forEach((el) => {
      if (el.id && !el.id.startsWith(prefix)) {
        el.id = prefix + el.id;
      }
    });
    root.querySelectorAll("a[href^='#']").forEach((node) => {
      const a = node as HTMLAnchorElement;
      const hash = (a.getAttribute("href") || "").slice(1);
      if (hash && !hash.startsWith(prefix)) {
        a.setAttribute("href", `#${prefix}${hash}`);
      }
    });
    root.querySelectorAll("[data-gloss]").forEach((el) => {
      const key = el.getAttribute("data-gloss") || "";
      if (key && !key.startsWith(prefix)) {
        el.setAttribute("data-gloss", prefix + key);
      }
    });
    root.querySelectorAll("[data-snip]").forEach((el) => {
      const key = el.getAttribute("data-snip") || "";
      if (key && !key.startsWith(prefix)) {
        el.setAttribute("data-snip", prefix + key);
      }
    });
  }, [props.slug]);
  return (
    <section ref={ref} className="site-folder" id={props.slug} data-folder={props.slug}>
      {props.children}
    </section>
  );
}

const GROK_BOT_PARTS: Folder[] = [
  {
    slug: "grok-bot",
    label: "Grok Bot",
    toc: grok018Toc,
    gloss: grok018Gloss,
    srcMap: grok018Src as Record<string, unknown>,
    Doc: () => <Grok018Doc />,
  },
];

const RHC_PARTS: Folder[] = [
  {
    slug: "rhc",
    label: "程式導讀",
    toc: rhcToc,
    gloss: rhcGloss,
    srcMap: rhcSrc as Record<string, unknown>,
    Doc: () => <RhcDoc />,
  },
  {
    slug: "rhc-oauth",
    label: "OAuth 登入",
    toc: rhcOAuthToc,
    gloss: rhcOAuthGloss,
    srcMap: rhcOAuthSrc as Record<string, unknown>,
    Doc: () => <RhcOAuthDoc />,
  },
];

const FOLDERS: Folder[] = [
  {
    slug: "codex",
    label: "Codex",
    toc: codexToc,
    gloss: codexGloss,
    srcMap: codexSrc as Record<string, unknown>,
    Doc: () => <CodexDoc />,
  },
  {
    slug: "claude",
    label: "Claude Code",
    toc: claudeToc,
    gloss: claudeGloss,
    srcMap: claudeSrc as Record<string, unknown>,
    Doc: () => <ClaudeDoc />,
  },
  {
    slug: "grok-build",
    label: "Grok Build",
    toc: grokBuildToc,
    gloss: grokBuildGloss,
    srcMap: grokBuildSrc as Record<string, unknown>,
    Doc: () => <GrokBuildDoc />,
  },
];

const TOOLS: Tool[] = [
  { slug: "rhc-tool", label: "rhc", parts: RHC_PARTS },
  { slug: "grok-bot", label: "Grok Bot", parts: GROK_BOT_PARTS },
  ...FOLDERS.map((folder) => ({
    slug: folder.slug,
    label: folder.label,
    parts: [folder],
  })),
];

const ALL_PARTS = TOOLS.flatMap((tool) => tool.parts);

const GLOSS = Object.assign(
  {},
  ...ALL_PARTS.map((folder) => prefixRecord(folder.slug, folder.gloss)),
);
const SRC_MAP_JSON = JSON.stringify(
  Object.assign(
    {},
    ...ALL_PARTS.map((folder) => prefixRecord(folder.slug, folder.srcMap)),
  ),
);

function toolToc(tool: Tool): TocLink {
  const [folder] = tool.parts;
  if (tool.parts.length === 1 && folder) {
    return {
      href: `#${folder.slug}`,
      n: "",
      label: tool.label,
      children: prefixToc(folder.slug, folder.toc),
    };
  }
  return {
    href: `#${tool.slug}`,
    n: "",
    label: tool.label,
    children: tool.parts.map((folder) => ({
      href: `#${folder.slug}`,
      n: "",
      label: folder.label,
      children: prefixToc(folder.slug, folder.toc),
    })),
  };
}

export function Site() {
  return (
    <ExplainerShell
      title="Explainers"
      subtitle="順序是 rhc、Grok Bot、Codex、Claude Code、Grok Build。"
      kicker="catalog"
      mastNote="同一頁捲動。點章不換 path。"
      toc={TOOLS.map(toolToc)}
      gloss={GLOSS}
      srcMapJson={SRC_MAP_JSON}
    >
      <MDXProvider components={mdxComponents}>
        <SiteApex />
        {TOOLS.map((tool) => (
          <section key={tool.slug} id={tool.slug}>
            {tool.parts.map((folder) => (
              <FolderDoc key={folder.slug} slug={folder.slug}>
                <folder.Doc />
              </FolderDoc>
            ))}
          </section>
        ))}
      </MDXProvider>
    </ExplainerShell>
  );
}

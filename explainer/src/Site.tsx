import { useLayoutEffect, useRef, type ReactNode } from "react";
import { MDXProvider } from "@mdx-js/react";
import { ExplainerShell } from "./ExplainerShell";
import { mdxComponents } from "./mdx-components";
import { FolderSlug } from "./folder";
import type { TocLink } from "./CatalogRail";
import type { GlossEntry } from "./components/Term";
import type { SrcEntry } from "./components/SourceSheet";
import AuthRhcDoc from "./auth/rhc/page.mdx";
import { GLOSS as auth_rhc_gloss } from "./auth/rhc/gloss";
import auth_rhc_src from "./auth/rhc/src-map.json";
import { FOLDER_TOC as auth_rhc_toc } from "./auth/rhc/catalog-toc";
import AuthGrokBotDoc from "./auth/grok-bot/page.mdx";
import { GLOSS as auth_grok_bot_gloss } from "./auth/grok-bot/gloss";
import auth_grok_bot_src from "./auth/grok-bot/src-map.json";
import AuthCodexDoc from "./auth/codex/page.mdx";
import { GLOSS as auth_codex_gloss } from "./auth/codex/gloss";
import auth_codex_src from "./auth/codex/src-map.json";
import AuthClaudeCodeDoc from "./auth/claude-code/page.mdx";
import { GLOSS as auth_claude_code_gloss } from "./auth/claude-code/gloss";
import auth_claude_code_src from "./auth/claude-code/src-map.json";
import AuthGrokBuildDoc from "./auth/grok-build/page.mdx";
import { GLOSS as auth_grok_build_gloss } from "./auth/grok-build/gloss";
import auth_grok_build_src from "./auth/grok-build/src-map.json";

type Folder = {
  slug: string;
  label: string;
  toc: TocLink[];
  gloss: Record<string, GlossEntry>;
  srcMap: Record<string, SrcEntry>;
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
  }, [props.slug]);
  return (
    <section ref={ref} className="site-folder" id={props.slug} data-folder={props.slug}>
      <FolderSlug.Provider value={props.slug}>{props.children}</FolderSlug.Provider>
    </section>
  );
}

/** One tool row per component; under it, each harness that has that component. */
const TOOLS: Tool[] = [
  {
    slug: "auth",
    label: "登入",
    parts: [
      { slug: "auth-rhc", label: "rhc", toc: auth_rhc_toc, gloss: auth_rhc_gloss, srcMap: auth_rhc_src as Record<string, SrcEntry>, Doc: () => <AuthRhcDoc /> },
      { slug: "auth-grok-bot", label: "Grok Bot", toc: [], gloss: auth_grok_bot_gloss, srcMap: auth_grok_bot_src as Record<string, SrcEntry>, Doc: () => <AuthGrokBotDoc /> },
      { slug: "auth-codex", label: "Codex", toc: [], gloss: auth_codex_gloss, srcMap: auth_codex_src as Record<string, SrcEntry>, Doc: () => <AuthCodexDoc /> },
      { slug: "auth-claude-code", label: "Claude Code", toc: [], gloss: auth_claude_code_gloss, srcMap: auth_claude_code_src as Record<string, SrcEntry>, Doc: () => <AuthClaudeCodeDoc /> },
      { slug: "auth-grok-build", label: "Grok Build", toc: [], gloss: auth_grok_build_gloss, srcMap: auth_grok_build_src as Record<string, SrcEntry>, Doc: () => <AuthGrokBuildDoc /> },
    ],
  },
];

const ALL_PARTS = TOOLS.flatMap((tool) => tool.parts);

export const GLOSS: Record<string, GlossEntry> = Object.assign(
  {},
  ...ALL_PARTS.map((folder) => prefixRecord(folder.slug, folder.gloss)),
);
export const SRC_MAP: Record<string, SrcEntry> = Object.assign(
  {},
  ...ALL_PARTS.map((folder) => prefixRecord(folder.slug, folder.srcMap)),
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
      subtitle="登入：rhc 與各家 harness 怎麼拿到票。"
      kicker="catalog"
      mastNote="同一頁捲動。點章不換 path。"
      toc={TOOLS.map(toolToc)}
      gloss={GLOSS}
      srcMap={SRC_MAP}
    >
      <MDXProvider components={mdxComponents}>
        {TOOLS.map((tool) => (
          <section key={tool.slug} id={tool.slug}>
            <h1 className="not-prose mb-6 text-[length:var(--fs-h1)] leading-[1.1] font-[850] tracking-[-0.018em]">{tool.label}</h1>
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

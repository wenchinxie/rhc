import { useLayoutEffect, useRef, type ReactNode } from "react";
import { MDXProvider } from "@mdx-js/react";
import { ExplainerShell } from "./ExplainerShell";
import { mdxComponents } from "./mdx-components";
import { FolderSlug } from "./folder";
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
import SessionGrokBotDoc from "./session/grok-bot/page.mdx";
import SessionCodexDoc from "./session/codex/page.mdx";
import SessionClaudeCodeDoc from "./session/claude-code/page.mdx";
import SessionGrokBuildDoc from "./session/grok-build/page.mdx";
import PromptGrokBotDoc from "./prompt/grok-bot/page.mdx";
import PromptCodexDoc from "./prompt/codex/page.mdx";
import PromptClaudeCodeDoc from "./prompt/claude-code/page.mdx";
import PromptGrokBuildDoc from "./prompt/grok-build/page.mdx";
import ModelRhcDoc from "./model/rhc/page.mdx";
import model_rhc_src from "./model/rhc/src-map.json";
import ModelGrokBotDoc from "./model/grok-bot/page.mdx";
import ModelCodexDoc from "./model/codex/page.mdx";
import ModelClaudeCodeDoc from "./model/claude-code/page.mdx";
import ModelGrokBuildDoc from "./model/grok-build/page.mdx";
import ToolsGrokBotDoc from "./tools/grok-bot/page.mdx";
import ToolsCodexDoc from "./tools/codex/page.mdx";
import ToolsClaudeCodeDoc from "./tools/claude-code/page.mdx";
import ToolsGrokBuildDoc from "./tools/grok-build/page.mdx";
import TurnGrokBotDoc from "./turn/grok-bot/page.mdx";
import TurnCodexDoc from "./turn/codex/page.mdx";
import TurnClaudeCodeDoc from "./turn/claude-code/page.mdx";
import TurnGrokBuildDoc from "./turn/grok-build/page.mdx";
import RestGrokBotDoc from "./rest/grok-bot/page.mdx";
import RestCodexDoc from "./rest/codex/page.mdx";
import RestClaudeCodeDoc from "./rest/claude-code/page.mdx";
import RestGrokBuildDoc from "./rest/grok-build/page.mdx";

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
      { slug: "auth-rhc", label: "rhc", toc: auth_rhc_toc, gloss: auth_rhc_gloss, srcMap: auth_rhc_src as Record<string, unknown>, Doc: () => <AuthRhcDoc /> },
      { slug: "auth-grok-bot", label: "Grok Bot", toc: [], gloss: auth_grok_bot_gloss, srcMap: auth_grok_bot_src as Record<string, unknown>, Doc: () => <AuthGrokBotDoc /> },
      { slug: "auth-codex", label: "Codex", toc: [], gloss: auth_codex_gloss, srcMap: auth_codex_src as Record<string, unknown>, Doc: () => <AuthCodexDoc /> },
      { slug: "auth-claude-code", label: "Claude Code", toc: [], gloss: auth_claude_code_gloss, srcMap: auth_claude_code_src as Record<string, unknown>, Doc: () => <AuthClaudeCodeDoc /> },
      { slug: "auth-grok-build", label: "Grok Build", toc: [], gloss: auth_grok_build_gloss, srcMap: auth_grok_build_src as Record<string, unknown>, Doc: () => <AuthGrokBuildDoc /> },
    ],
  },
  {
    slug: "session",
    label: "對話",
    parts: [
      { slug: "session-grok-bot", label: "Grok Bot", toc: [], gloss: {}, srcMap: {}, Doc: () => <SessionGrokBotDoc /> },
      { slug: "session-codex", label: "Codex", toc: [], gloss: {}, srcMap: {}, Doc: () => <SessionCodexDoc /> },
      { slug: "session-claude-code", label: "Claude Code", toc: [], gloss: {}, srcMap: {}, Doc: () => <SessionClaudeCodeDoc /> },
      { slug: "session-grok-build", label: "Grok Build", toc: [], gloss: {}, srcMap: {}, Doc: () => <SessionGrokBuildDoc /> },
    ],
  },
  {
    slug: "prompt",
    label: "提示",
    parts: [
      { slug: "prompt-grok-bot", label: "Grok Bot", toc: [], gloss: {}, srcMap: {}, Doc: () => <PromptGrokBotDoc /> },
      { slug: "prompt-codex", label: "Codex", toc: [], gloss: {}, srcMap: {}, Doc: () => <PromptCodexDoc /> },
      { slug: "prompt-claude-code", label: "Claude Code", toc: [], gloss: {}, srcMap: {}, Doc: () => <PromptClaudeCodeDoc /> },
      { slug: "prompt-grok-build", label: "Grok Build", toc: [], gloss: {}, srcMap: {}, Doc: () => <PromptGrokBuildDoc /> },
    ],
  },
  {
    slug: "model",
    label: "模型",
    parts: [
      { slug: "model-rhc", label: "rhc", toc: [], gloss: {}, srcMap: model_rhc_src as Record<string, unknown>, Doc: () => <ModelRhcDoc /> },
      { slug: "model-grok-bot", label: "Grok Bot", toc: [], gloss: {}, srcMap: {}, Doc: () => <ModelGrokBotDoc /> },
      { slug: "model-codex", label: "Codex", toc: [], gloss: {}, srcMap: {}, Doc: () => <ModelCodexDoc /> },
      { slug: "model-claude-code", label: "Claude Code", toc: [], gloss: {}, srcMap: {}, Doc: () => <ModelClaudeCodeDoc /> },
      { slug: "model-grok-build", label: "Grok Build", toc: [], gloss: {}, srcMap: {}, Doc: () => <ModelGrokBuildDoc /> },
    ],
  },
  {
    slug: "tools",
    label: "工具",
    parts: [
      { slug: "tools-grok-bot", label: "Grok Bot", toc: [], gloss: {}, srcMap: {}, Doc: () => <ToolsGrokBotDoc /> },
      { slug: "tools-codex", label: "Codex", toc: [], gloss: {}, srcMap: {}, Doc: () => <ToolsCodexDoc /> },
      { slug: "tools-claude-code", label: "Claude Code", toc: [], gloss: {}, srcMap: {}, Doc: () => <ToolsClaudeCodeDoc /> },
      { slug: "tools-grok-build", label: "Grok Build", toc: [], gloss: {}, srcMap: {}, Doc: () => <ToolsGrokBuildDoc /> },
    ],
  },
  {
    slug: "turn",
    label: "一輪",
    parts: [
      { slug: "turn-grok-bot", label: "Grok Bot", toc: [], gloss: {}, srcMap: {}, Doc: () => <TurnGrokBotDoc /> },
      { slug: "turn-codex", label: "Codex", toc: [], gloss: {}, srcMap: {}, Doc: () => <TurnCodexDoc /> },
      { slug: "turn-claude-code", label: "Claude Code", toc: [], gloss: {}, srcMap: {}, Doc: () => <TurnClaudeCodeDoc /> },
      { slug: "turn-grok-build", label: "Grok Build", toc: [], gloss: {}, srcMap: {}, Doc: () => <TurnGrokBuildDoc /> },
    ],
  },
  {
    slug: "rest",
    label: "旁邊的槽",
    parts: [
      { slug: "rest-grok-bot", label: "Grok Bot", toc: [], gloss: {}, srcMap: {}, Doc: () => <RestGrokBotDoc /> },
      { slug: "rest-codex", label: "Codex", toc: [], gloss: {}, srcMap: {}, Doc: () => <RestCodexDoc /> },
      { slug: "rest-claude-code", label: "Claude Code", toc: [], gloss: {}, srcMap: {}, Doc: () => <RestClaudeCodeDoc /> },
      { slug: "rest-grok-build", label: "Grok Build", toc: [], gloss: {}, srcMap: {}, Doc: () => <RestGrokBuildDoc /> },
    ],
  },
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
      subtitle="按元件分：登入、對話、提示、模型、工具、一輪、旁邊的槽。每個元件底下是 rhc 與各家 harness。"
      kicker="catalog"
      mastNote="同一頁捲動。點章不換 path。"
      toc={TOOLS.map(toolToc)}
      gloss={GLOSS}
      srcMapJson={SRC_MAP_JSON}
    >
      <MDXProvider components={mdxComponents}>
        {TOOLS.map((tool) => (
          <section key={tool.slug} id={tool.slug}>
            <h1>{tool.label}</h1>
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

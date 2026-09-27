import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { XIcon } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export type SrcEntry = {
  kind?: string;
  title: string;
  meta: string;
  why?: string;
  start: number;
  lines: string[];
  hi: number[];
};

const OpenSource = createContext<(key: string, opener: HTMLElement) => void>(() => {});

export function useOpenSource() {
  return useContext(OpenSource);
}

type Lang = "rust" | "ts" | "json" | "text";
type Syn = "kw" | "str" | "num" | "fn" | "ty" | "cmt";

const KEYWORDS: Record<Lang, Set<string>> = {
  rust: new Set(
    "as async await break const continue else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while".split(
      " ",
    ),
  ),
  ts: new Set(
    "as async await break case catch class const continue default else export extends false finally for from function if import in instanceof interface let new null of return static super switch this throw true try type typeof undefined var while yield".split(
      " ",
    ),
  ),
  json: new Set(["true", "false", "null"]),
  text: new Set(),
};

const SYN_CLASS: Record<Syn, string> = {
  kw: "font-[650] text-(--syn-kw)",
  str: "text-(--syn-str)",
  num: "text-(--syn-num)",
  fn: "text-(--syn-fn)",
  ty: "text-(--syn-ty)",
  cmt: "italic text-(--syn-cmt)",
};

function langOf(meta: string): Lang {
  const ext = meta.match(/\.([a-z0-9]+)(?::|\d|$)/i)?.[1]?.toLowerCase() ?? "";
  if (ext === "rs") return "rust";
  if (ext === "json") return "json";
  if (["ts", "tsx", "js", "jsx", "mjs", "cjs"].includes(ext)) return "ts";
  return "text";
}

function dedent(lines: string[]): string[] {
  const leads = lines.filter((l) => l.trim()).map((l) => l.match(/^[ \t]*/)![0].length);
  const min = leads.length ? Math.min(...leads) : 0;
  return min ? lines.map((l) => l.slice(min)) : lines;
}

type Part = { syn?: Syn; text: string };

function paint(line: string, lang: Lang, inBlock: boolean): { parts: Part[]; inBlock: boolean } {
  const parts: Part[] = [];
  const push = (syn: Syn | undefined, text: string) => text && parts.push({ syn, text });
  let i = 0;
  if (inBlock) {
    const end = line.indexOf("*/");
    if (end < 0) return { parts: [{ syn: "cmt", text: line }], inBlock: true };
    push("cmt", line.slice(0, end + 2));
    i = end + 2;
  }
  while (i < line.length) {
    const rest = line.slice(i);
    if (rest.startsWith("//")) {
      push("cmt", rest);
      break;
    }
    if (rest.startsWith("/*")) {
      const close = rest.indexOf("*/", 2);
      if (close < 0) {
        push("cmt", rest);
        return { parts, inBlock: true };
      }
      push("cmt", rest.slice(0, close + 2));
      i += close + 2;
      continue;
    }
    const q = rest[0];
    if (q === '"' || q === "'" || q === "`") {
      let j = 1;
      while (j < rest.length) {
        if (rest[j] === "\\") j += 2;
        else if (rest[j++] === q) break;
      }
      push("str", rest.slice(0, j));
      i += j;
      continue;
    }
    const num = rest.match(/^\d[\d_]*/)?.[0];
    if (num) {
      push("num", num);
      i += num.length;
      continue;
    }
    const word = rest.match(/^[A-Za-z_]\w*/)?.[0];
    if (word) {
      const after = rest.slice(word.length);
      push(
        KEYWORDS[lang].has(word) ? "kw" : /^\s*\(/.test(after) ? "fn" : /^[A-Z]/.test(word) ? "ty" : undefined,
        word,
      );
      i += word.length;
      continue;
    }
    push(undefined, rest[0]!);
    i += 1;
  }
  return { parts, inBlock: false };
}

function Code({ entry }: { entry: SrcEntry }) {
  const lang = langOf(entry.meta);
  let inBlock = false;
  const rows = dedent(entry.lines).map((line, i) => {
    const n = entry.start + i;
    const painted = paint(line, lang, inBlock);
    inBlock = painted.inBlock;
    const hi = entry.hi.includes(n);
    return (
      <span
        key={n}
        data-line
        data-hi={hi || undefined}
        className={`grid grid-cols-[3.4em_1fr] gap-x-3.5 pr-3 pl-2 ${hi ? "bg-pen-tint" : ""}`}
      >
        <span data-ln className="text-right text-ink-3 select-none">
          {n}
        </span>
        <span className="whitespace-pre-wrap [overflow-wrap:anywhere]">
          {painted.parts.map((p, k) =>
            p.syn ? (
              <span key={k} data-syn={p.syn} className={SYN_CLASS[p.syn]}>
                {p.text}
              </span>
            ) : (
              p.text
            ),
          )}
        </span>
      </span>
    );
  });
  return (
    <pre className="m-0 overflow-x-auto rounded-md border border-line bg-paper-2 py-3 font-code text-sm leading-relaxed text-ink">
      <code>{rows}</code>
    </pre>
  );
}

export function SourceSheet(props: { map: Record<string, SrcEntry>; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState<string | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const entry = key ? props.map[key] : undefined;
  const show = (k: string, from: HTMLElement) => {
    if (!props.map[k]) return;
    opener.current = from;
    setKey(k);
    setOpen(true);
  };
  return (
    <OpenSource.Provider value={show}>
      {props.children}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          data-source-sheet
          showCloseButton={false}
          onCloseAutoFocus={(ev) => {
            ev.preventDefault();
            opener.current?.focus();
          }}
          className="w-[min(46rem,94vw)] gap-3 overflow-y-auto overscroll-contain border-line-strong bg-paper px-7 pt-6 pb-12 sm:max-w-none"
        >
          {entry ? (
            <>
              <SheetHeader className="gap-1 p-0 pr-8">
                {entry.kind ? <p className="font-code text-xs tracking-widest text-ink-3">{entry.kind}</p> : null}
                <SheetTitle className="text-xl font-bold text-ink">{entry.title}</SheetTitle>
                <SheetDescription className="font-code text-sm text-ink-3">{entry.meta}</SheetDescription>
              </SheetHeader>
              {entry.why ? <p className="text-base text-ink">{entry.why}</p> : null}
              <Code entry={entry} />
              <SheetClose
                aria-label="關閉對照面板"
                className="absolute top-4 right-4 cursor-pointer rounded-xs text-ink-3 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <XIcon className="size-4" />
              </SheetClose>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </OpenSource.Provider>
  );
}

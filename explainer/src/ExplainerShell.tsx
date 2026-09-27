import type { ReactNode } from "react";
import { CatalogButton, CatalogRail, type TocLink } from "./CatalogRail";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Gloss, type GlossEntry } from "./components/Term";
import { SourceSheet, type SrcEntry } from "./components/SourceSheet";

export function ExplainerShell(props: {
  title: string;
  subtitle?: string;
  kicker?: string;
  mastNote?: string;
  toc: TocLink[];
  tocLabel?: string;
  headerExtra?: ReactNode;
  gloss: Record<string, GlossEntry>;
  srcMap: Record<string, SrcEntry>;
  children: ReactNode;
}) {
  const tocLabel = props.tocLabel ?? "目錄";

  return (
    <SidebarProvider defaultOpen={!globalThis.document?.cookie?.includes("sidebar_state=false")}>
      <CatalogRail
        toc={props.toc}
        label={tocLabel}
        kicker={props.kicker}
      />
      <SidebarInset className="min-w-0">
      <CatalogButton label={tocLabel} />
      <article className="doc doc-type @container mx-auto w-full min-w-0 px-[clamp(1.2rem,4vw,5rem)] pt-[clamp(1.2rem,4vw,3rem)] pb-24 md:pl-[clamp(3rem,4vw,5rem)] prose prose-ivory max-w-none *:[font-size:var(--fs-body)] [&_h4_.no]:mr-2 [&_h4_.no]:font-code [&_h4_.no]:text-[0.88em] [&_h4_.no]:font-normal [&_h4_.no]:text-ink-3">
        <header className="not-prose">
          <h1 className="mb-6 text-[length:var(--fs-h1)] leading-[1.1] font-[850] tracking-[-0.018em]">
            {props.title}
            {props.subtitle ? (
              <span className="mt-1.5 block text-[0.58em] leading-tight font-medium tracking-[-0.005em] text-ink-2">
                {props.subtitle}
              </span>
            ) : null}
          </h1>
          {props.mastNote ? (
            <p className="m-0 border-y border-line-strong py-3 text-[length:var(--fs-xs)] text-ink-3">{props.mastNote}</p>
          ) : null}
          {props.headerExtra}
        </header>
        <Gloss.Provider value={props.gloss}>
          <SourceSheet map={props.srcMap}>{props.children}</SourceSheet>
        </Gloss.Provider>
      </article>
      </SidebarInset>
    </SidebarProvider>
  );
}

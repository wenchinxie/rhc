import { useEffect, type ReactNode } from "react";
import { CatalogRail, type TocLink } from "./CatalogRail";
import "./explainer.js";

declare global {
  interface Window {
    GLOSS?: Record<string, { t: string; d: string; avoid?: string[] }>;
    initExplainerShell?: () => void;
    __explainerShellOn?: boolean;
  }
}

export function ExplainerShell(props: {
  title: string;
  subtitle?: string;
  kicker?: string;
  mastNote?: string;
  toc: TocLink[];
  tocLabel?: string;
  tocLead?: ReactNode;
  headerExtra?: ReactNode;
  railNote?: ReactNode;
  gloss: Record<string, { t: string; d: string; avoid?: string[] }>;
  srcMapJson: string;
  children: ReactNode;
}) {
  const tocLabel = props.tocLabel ?? "目錄";
  useEffect(() => {
    window.GLOSS = props.gloss;
    const el = document.getElementById("SRC_MAP");
    if (el) el.textContent = props.srcMapJson;
    window.initExplainerShell?.();
  }, [props.gloss, props.srcMapJson]);

  return (
    <>
      <CatalogRail
        toc={props.toc}
        label={tocLabel}
        kicker={props.kicker}
        lead={props.tocLead}
        railNote={props.railNote}
      />
      <article className="doc">
        <header>
          <h1>
            {props.title}
            {props.subtitle ? <span>{props.subtitle}</span> : null}
          </h1>
          {props.mastNote ? <p className="mast-note">{props.mastNote}</p> : null}
          {props.headerExtra}
        </header>
        {props.children}
      </article>
      <script
        type="application/json"
        id="SRC_MAP"
        dangerouslySetInnerHTML={{ __html: props.srcMapJson }}
      />
      <div id="gloss-backdrop" />
      <div id="gloss-card" role="dialog" aria-modal="false">
        <div id="gloss-card-title" />
        <div id="gloss-card-text" />
      </div>
      <div id="srcscrim" aria-hidden="true" />
      <aside
        id="srcpane"
        tabIndex={-1}
        aria-label="原文對照"
        aria-hidden="true"
      >
        <button id="srcclose" type="button" aria-label="關閉對照面板">
          ×
        </button>
        <p id="src-kind" />
        <h2 id="src-title" />
        <p id="src-meta" />
        <div id="src-why" />
        <div id="src-body" />
      </aside>
    </>
  );
}

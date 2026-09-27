import { useEffect, type ReactNode } from "react";
import "./explainer.js";

declare global {
  interface Window {
    GLOSS?: Record<string, { t: string; d: string; avoid?: string[] }>;
    initExplainerShell?: () => void;
    __explainerShellOn?: boolean;
  }
}

type TocLink = { href: string; n?: string; label: string; children?: TocLink[] };

/** One id per group, derived from the parent href so it is stable across renders. */
function subId(href: string) {
  return "sub-" + href.replace(/^#/, "");
}

function TocAnchor(props: TocLink) {
  return (
    <a href={props.href}>
      <i>{props.n ?? ""}</i>
      {props.label}
    </a>
  );
}

function TocItem(props: TocLink) {
  if (props.children && props.children.length > 0) {
    return (
      <span className="toc-group">
        <TocAnchor href={props.href} n={props.n} label={props.label} />
        <button
          type="button"
          className="toc-tg"
          aria-expanded="false"
          aria-controls={subId(props.href)}
          aria-label="展開/收合"
        >
          ›
        </button>
        <span className="toc-sub" id={subId(props.href)}>
          {props.children.map((c) => (
            <TocItem key={`${c.href}-${c.label}`} {...c} />
          ))}
        </span>
      </span>
    );
  }
  return <TocAnchor href={props.href} n={props.n} label={props.label} />;
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
      <button type="button" id="tocbtn" aria-controls="toc" aria-expanded="false">
        {tocLabel}
      </button>
      <div id="tocscrim" hidden />
      <nav className="toc" id="toc" aria-label={tocLabel}>
        <button type="button" id="tocclose" aria-label={tocLabel}>
          ×
        </button>
        <div className="toc-scroll">
          {props.tocLead}
          {props.kicker ? <div className="t">{props.kicker}</div> : null}
          {props.toc.map((l) => (
            <TocItem key={`${l.href}-${l.label}`} {...l} />
          ))}
          {props.railNote ? <div className="rail-note">{props.railNote}</div> : null}
        </div>
      </nav>
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

import { Fragment, useEffect, type ReactNode } from "react";

declare global {
  interface Window {
    GLOSS?: Record<string, { t: string; d: string; avoid?: string[] }>;
    initExplainerShell?: () => void;
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
      {props.n != null ? <i>{props.n}</i> : null}
      {props.label}
    </a>
  );
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
    window.initExplainerShell?.();
  }, [props.gloss]);

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
        {props.tocLead}
        {props.kicker ? <div className="t">{props.kicker}</div> : null}
        {props.toc.map((l) =>
          l.children && l.children.length > 0 ? (
            <span className="toc-group" key={l.href}>
              <TocAnchor href={l.href} n={l.n} label={l.label} />
              <button
                type="button"
                className="toc-tg"
                aria-expanded="false"
                aria-controls={subId(l.href)}
                aria-label="展開/收合"
              >
                ›
              </button>
              <span className="toc-sub" id={subId(l.href)}>
                {l.children.map((c) => (
                  <TocAnchor key={c.href} href={c.href} n={c.n} label={c.label} />
                ))}
              </span>
            </span>
          ) : (
            <Fragment key={l.href}>
              <TocAnchor href={l.href} n={l.n} label={l.label} />
            </Fragment>
          ),
        )}
        {props.railNote ? <div className="rail-note">{props.railNote}</div> : null}
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
    </>
  );
}

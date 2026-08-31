import { Fragment, useEffect, type ReactNode } from "react";

declare global {
  interface Window {
    GLOSS?: Record<string, { t: string; d: string; avoid?: string[] }>;
    initExplainerShell?: () => void;
  }
}

type TocLink = { href: string; n?: string; label: string; children?: TocLink[] };

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
  railNote?: ReactNode;
  gloss: Record<string, { t: string; d: string; avoid?: string[] }>;
  srcMapJson: string;
  children: ReactNode;
}) {
  useEffect(() => {
    window.GLOSS = props.gloss;
    window.initExplainerShell?.();
  }, [props.gloss]);

  return (
    <>
      <button type="button" id="tocbtn" aria-controls="toc" aria-expanded="false">
        目錄
      </button>
      <div id="tocscrim" hidden />
      <nav className="toc" id="toc" aria-label="目錄">
        <button type="button" id="tocclose" aria-label="關閉目錄">
          ×
        </button>
        {props.kicker ? <div className="t">{props.kicker}</div> : null}
        {props.toc.map((l) => (
          <Fragment key={l.href}>
            <TocAnchor href={l.href} n={l.n} label={l.label} />
            {l.children && l.children.length > 0 ? (
              <span className="toc-sub">
                {l.children.map((c) => (
                  <TocAnchor key={c.href} href={c.href} n={c.n} label={c.label} />
                ))}
              </span>
            ) : null}
          </Fragment>
        ))}
        {props.railNote ? <div className="rail-note">{props.railNote}</div> : null}
      </nav>
      <article className="doc">
        <header>
          <h1>
            {props.title}
            {props.subtitle ? <span>{props.subtitle}</span> : null}
          </h1>
          {props.mastNote ? <p className="mast-note">{props.mastNote}</p> : null}
        </header>
        {props.children}
      </article>
    </>
  );
}

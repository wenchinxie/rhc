import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";

export type TocLink = { href: string; n?: string; label: string; children?: TocLink[] };

type TocIndex = { ids: string[]; parentOf: Map<string, string> };

/** Document order of every target, and each link's parent group. */
function indexToc(toc: TocLink[]): TocIndex {
  const ids: string[] = [];
  const parentOf = new Map<string, string>();
  const walk = (links: TocLink[], parent?: string) => {
    for (const l of links) {
      const id = l.href.slice(1);
      ids.push(id);
      if (parent) parentOf.set(id, parent);
      if (l.children) walk(l.children, id);
    }
  };
  walk(toc);
  return { ids, parentOf };
}

function ancestors(index: TocIndex, id: string | null): Set<string> {
  const out = new Set<string>();
  for (let p = id && index.parentOf.get(id); p; p = index.parentOf.get(p)) out.add(p);
  return out;
}

function tokenPx(name: string, fallback: number): number {
  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;left:-9999px;top:0;height:0;padding:0;border:0;margin:0;width:var(${name})`;
  document.documentElement.appendChild(probe);
  const w = probe.getBoundingClientRect().width;
  probe.remove();
  return w || fallback;
}

function readRailClosed(): boolean {
  try {
    return localStorage.getItem("rail-closed") === "1";
  } catch {
    return false;
  }
}

function useBodyClass(name: string, on: boolean) {
  useLayoutEffect(() => {
    document.body.classList.toggle(name, on);
  }, [name, on]);
}

/** Keeps `el` inside the rail's own scroller, never scrolling the page. */
function scrollIntoRail(nav: HTMLElement | null, el: Element | null) {
  if (!nav || !el || !document.body.classList.contains("rail-on")) return;
  const box = nav.querySelector(".toc-scroll");
  if (!box) return;
  const cr = el.getBoundingClientRect();
  const br = box.getBoundingClientRect();
  if (cr.height === 0 || br.height === 0) return;
  if (cr.top < br.top + 4) box.scrollTop -= br.top + 4 - cr.top;
  else if (cr.bottom > br.bottom - 4) box.scrollTop += cr.bottom - (br.bottom - 4);
}

function scrollToId(id: string): boolean {
  const el = id ? document.getElementById(id) : null;
  if (!el) return false;
  el.scrollIntoView({ block: "start" });
  return true;
}

/**
 * The rail is shown only when the prose and the rail both fit, and only when
 * the collapsed catalog fits the rail's scroller; otherwise the same nav is the
 * sheet behind #tocbtn. Measuring the expanded height instead would drop the
 * rail whenever a long chapter opened.
 */
function useRailFit(nav: RefObject<HTMLElement | null>): boolean {
  const [railOn, setRailOn] = useState(false);
  useLayoutEffect(() => {
    let timer = 0;
    const fit = () => {
      const el = nav.current;
      if (!el) return;
      const body = document.body;
      const need = tokenPx("--prose", 720) + tokenPx("--rail-w", 240) + tokenPx("--rail-gap", 48) + 24;
      let on = document.documentElement.clientWidth >= need;
      if (on) {
        body.classList.add("rail-on");
        const box = el.querySelector(".toc-scroll") ?? el;
        el.classList.add("measuring");
        on = box.scrollHeight <= box.clientHeight;
        el.classList.remove("measuring");
      }
      body.classList.toggle("rail-on", on);
      setRailOn(on);
    };
    const schedule = () => {
      clearTimeout(timer);
      timer = window.setTimeout(fit, 40);
    };
    fit();
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
    };
  }, [nav]);
  return railOn;
}

/** The current section is the last target, in document order, whose top has passed 28% of the viewport. */
function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const present = ids.filter((id) => document.getElementById(id));
    let raf = 0;
    const spy = () => {
      raf = 0;
      const line = window.innerHeight * 0.28;
      let current = present[0] ?? null;
      for (const id of present) {
        if (document.getElementById(id)!.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(spy);
    };
    spy();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", spy);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", spy);
    };
  }, [ids]);
  return active;
}

/** In-page links scroll without writing a hash, and a hash the page loads with is followed then removed. */
function useHashFreeLinks() {
  useEffect(() => {
    const onClick = (ev: MouseEvent) => {
      if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      const a = (ev.target as Element | null)?.closest?.('a[href^="#"]');
      if (a && scrollToId(decodeURIComponent(a.getAttribute("href")!.slice(1)))) ev.preventDefault();
    };
    const strip = () => {
      if (!location.hash) return;
      scrollToId(decodeURIComponent(location.hash.slice(1)));
      history.replaceState(null, "", location.pathname + location.search);
    };
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", strip);
    strip();
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", strip);
    };
  }, []);
}

type ItemProps = {
  link: TocLink;
  active: string | null;
  isOpen: (id: string) => boolean;
  onToggle: (id: string) => void;
};

function TocItem({ link, active, isOpen, onToggle }: ItemProps) {
  const id = link.href.slice(1);
  const anchor = (
    <a href={link.href} aria-current={active === id ? "true" : undefined}>
      <i>{link.n ?? ""}</i>
      {link.label}
    </a>
  );
  if (!link.children?.length) return anchor;
  const open = isOpen(id);
  return (
    <span className={open ? "toc-group open" : "toc-group"}>
      {anchor}
      <button
        type="button"
        className="toc-tg"
        aria-expanded={open}
        aria-controls={`sub-${id}`}
        aria-label="展開/收合"
        onClick={() => onToggle(id)}
      >
        ›
      </button>
      <span className="toc-sub" id={`sub-${id}`}>
        {link.children.map((c) => (
          <TocItem key={`${c.href}-${c.label}`} link={c} active={active} isOpen={isOpen} onToggle={onToggle} />
        ))}
      </span>
    </span>
  );
}

export function CatalogRail(props: {
  toc: TocLink[];
  label: string;
  kicker?: string;
  lead?: ReactNode;
  railNote?: ReactNode;
}) {
  const nav = useRef<HTMLElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const index = useMemo(() => indexToc(props.toc), [props.toc]);
  const railOn = useRailFit(nav);
  const active = useActiveSection(index.ids);
  const [railClosed, setRailClosed] = useState(readRailClosed);
  const [sheetOpen, setSheetOpen] = useState(false);
  /** A caret click overrides ownership: true stays open, false stays closed until the section changes. */
  const [manual, setManual] = useState<Map<string, boolean>>(() => new Map());
  const [lastOpened, setLastOpened] = useState<string | null>(null);
  useHashFreeLinks();
  useBodyClass("rail-closed", railClosed);
  useBodyClass("toc-open", sheetOpen);

  const owners = useMemo(() => ancestors(index, active), [index, active]);
  const isOpen = (id: string) => manual.get(id) ?? owners.has(id);

  useEffect(() => {
    setManual((m) => {
      if (![...m.values()].includes(false)) return m;
      return new Map([...m].filter(([, open]) => open));
    });
  }, [active]);

  useLayoutEffect(() => {
    scrollIntoRail(nav.current, nav.current?.querySelector("a[aria-current]") ?? null);
  }, [active, owners, railOn]);

  useLayoutEffect(() => {
    if (!lastOpened) return;
    const sub = document.getElementById(`sub-${lastOpened}`);
    scrollIntoRail(nav.current, sub?.lastElementChild ?? null);
  }, [lastOpened]);

  useEffect(() => {
    try {
      localStorage.setItem("rail-closed", railClosed ? "1" : "");
    } catch {}
  }, [railClosed]);

  const sheetMounted = useRef(false);
  useEffect(() => {
    if (!sheetMounted.current) {
      sheetMounted.current = true;
      return;
    }
    (sheetOpen ? nav.current : btn.current)?.focus();
    if (!sheetOpen) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setSheetOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  const toggle = (id: string) => {
    const open = !isOpen(id);
    setManual((m) => new Map(m).set(id, open));
    setLastOpened(open ? id : null);
  };

  return (
    <>
      <button
        ref={btn}
        type="button"
        id="tocbtn"
        aria-controls="toc"
        aria-expanded={sheetOpen}
        onClick={() => setSheetOpen((o) => !o)}
      >
        {props.label}
      </button>
      <div id="tocscrim" hidden onClick={() => setSheetOpen(false)} />
      <nav
        ref={nav}
        className="toc"
        id="toc"
        aria-label={props.label}
        tabIndex={-1}
        onClick={(ev) => {
          if ((ev.target as Element).closest("a")) setSheetOpen(false);
        }}
      >
        <button type="button" id="tocclose" aria-label={props.label} onClick={() => setSheetOpen(false)}>
          ×
        </button>
        <button
          type="button"
          id="railtg"
          aria-controls="toc"
          aria-expanded={!railClosed}
          aria-label={railClosed ? "展開目錄" : "收合目錄"}
          onClick={() => setRailClosed((c) => !c)}
        >
          {railClosed ? "»" : "«"}
        </button>
        <div className="toc-scroll">
          {props.lead}
          {props.kicker ? <div className="t">{props.kicker}</div> : null}
          {props.toc.map((l) => (
            <TocItem key={`${l.href}-${l.label}`} link={l} active={active} isOpen={isOpen} onToggle={toggle} />
          ))}
          {props.railNote ? <div className="rail-note">{props.railNote}</div> : null}
        </div>
      </nav>
    </>
  );
}

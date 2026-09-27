import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

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

function scrollIntoCatalog(box: HTMLElement | null, el: Element | null) {
  if (!box || !el) return;
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

function scrollAfterUnlock(id: string) {
  const start = performance.now();
  const tick = () => {
    if (document.body.hasAttribute("data-scroll-locked") && performance.now() - start < 1000) requestAnimationFrame(tick);
    else scrollToId(id);
  };
  requestAnimationFrame(tick);
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
  depth: number;
  active: string | null;
  isOpen: (id: string) => boolean;
  onToggle: (id: string) => void;
};

function Label({ link }: { link: TocLink }) {
  return (
    <>
      {link.n ? <span className="w-4 shrink-0 font-code text-xs text-ink-3">{link.n}</span> : null}
      <span>{link.label}</span>
    </>
  );
}

function CatalogItem({ link, depth, active, isOpen, onToggle }: ItemProps) {
  const id = link.href.slice(1);
  const current = active === id;
  const anchor = (
    <a href={link.href} aria-current={current ? "true" : undefined}>
      <Label link={link} />
    </a>
  );
  const button =
    depth === 0 ? (
      <SidebarMenuButton asChild isActive={current} className="h-auto py-1.5 font-semibold text-ink-2 data-[active=true]:text-pen-ink">
        {anchor}
      </SidebarMenuButton>
    ) : (
      <SidebarMenuSubButton
        asChild
        isActive={current}
        className={`h-auto py-1 text-ink-2 data-[active=true]:text-pen-ink [&>span:last-child]:whitespace-normal ${link.children?.length ? "pr-7" : ""}`}
      >
        {anchor}
      </SidebarMenuSubButton>
    );
  const Item = depth === 0 ? SidebarMenuItem : SidebarMenuSubItem;
  if (!link.children?.length) return <Item>{button}</Item>;
  const open = isOpen(id);
  return (
    <Collapsible asChild open={open} onOpenChange={() => onToggle(id)}>
      <Item data-group={id} className="relative">
        {button}
        <CollapsibleTrigger asChild>
          <SidebarMenuAction aria-label="展開/收合" className="data-[state=open]:rotate-90">
            <ChevronRight />
          </SidebarMenuAction>
        </CollapsibleTrigger>
        <CollapsibleContent forceMount className="data-[state=closed]:hidden">
          <SidebarMenuSub className={depth === 0 ? "mr-0 pr-0" : "mr-0 ml-1.5 pr-0 pl-2"}>
            {link.children.map((c) => (
              <CatalogItem
                key={`${c.href}-${c.label}`}
                link={c}
                depth={depth + 1}
                active={active}
                isOpen={isOpen}
                onToggle={onToggle}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Item>
    </Collapsible>
  );
}

export function CatalogButton({ label }: { label: string }) {
  const { isMobile, state, openMobile, toggleSidebar } = useSidebar();
  return (
    <button
      type="button"
      data-catalog-open
      aria-expanded={isMobile ? openMobile : false}
      onClick={toggleSidebar}
      className={`${state === "expanded" ? "md:hidden " : ""}fixed bottom-4 left-4 z-40 cursor-pointer rounded-full border border-line-strong bg-paper px-4 py-2 text-[length:var(--fs-xs)] font-semibold text-ink-2 shadow-md hover:text-pen-ink`}
    >
      {label}
    </button>
  );
}

export function CatalogRail(props: { toc: TocLink[]; label: string; kicker?: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const index = useMemo(() => indexToc(props.toc), [props.toc]);
  const active = useActiveSection(index.ids);
  const { isMobile, setOpenMobile } = useSidebar();
  /** A caret click overrides ownership: true stays open, false stays closed until the section changes. */
  const [manual, setManual] = useState<Map<string, boolean>>(() => new Map());
  const [lastOpened, setLastOpened] = useState<string | null>(null);
  useHashFreeLinks();

  const owners = useMemo(() => ancestors(index, active), [index, active]);
  const isOpen = (id: string) => manual.get(id) ?? owners.has(id);

  useEffect(() => {
    setManual((m) => {
      if (![...m.values()].includes(false)) return m;
      return new Map([...m].filter(([, open]) => open));
    });
  }, [active]);

  useLayoutEffect(() => {
    scrollIntoCatalog(scroller.current, scroller.current?.querySelector("a[aria-current]") ?? null);
  }, [active, owners]);

  useLayoutEffect(() => {
    if (!lastOpened) return;
    const group = scroller.current?.querySelector(`[data-group="${lastOpened}"] [data-sidebar="menu-sub"]`);
    scrollIntoCatalog(scroller.current, group?.lastElementChild ?? null);
  }, [lastOpened]);

  const toggle = (id: string) => {
    const open = !isOpen(id);
    setManual((m) => new Map(m).set(id, open));
    setLastOpened(open ? id : null);
  };

  return (
    <Sidebar
      label={props.label}
      className="border-none"
      onOpenAutoFocus={(ev) => {
        const here = scroller.current?.querySelector<HTMLElement>("a[aria-current]");
        if (!here) return;
        ev.preventDefault();
        here.focus({ preventScroll: true });
        scrollIntoCatalog(scroller.current, here);
      }}
    >
      <SidebarHeader className="flex-row items-center justify-between border-t-[3px] border-ink px-3 pt-3">
        {props.kicker ? <span className="font-code text-xs tracking-widest text-ink-3">{props.kicker}</span> : <span />}
        {isMobile ? null : <SidebarTrigger data-catalog-close aria-label="收合目錄" className="text-ink-3" />}
      </SidebarHeader>
      <SidebarContent
        ref={scroller}
        role="navigation"
        aria-label={props.label}
        data-catalog
        className="px-2 pb-6 [scrollbar-width:none]"
        onClick={(ev) => {
          const a = (ev.target as Element).closest('a[href^="#"]');
          if (!a || !isMobile) return;
          ev.preventDefault();
          setOpenMobile(false);
          scrollAfterUnlock(decodeURIComponent(a.getAttribute("href")!.slice(1)));
        }}
      >
        <SidebarMenu>
          {props.toc.map((l) => (
            <CatalogItem key={`${l.href}-${l.label}`} link={l} depth={0} active={active} isOpen={isOpen} onToggle={toggle} />
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

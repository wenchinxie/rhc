(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const fails = [];
  const expect = (ok, msg) => { if (!ok) fails.push(msg); };
  const LINE = () => innerHeight * 0.28;
  const catalog = () => document.querySelector("[data-catalog]");
  const curA = () => catalog()?.querySelector("a[aria-current]");
  const cur = () => { const a = curA(); return a ? a.getAttribute("href").slice(1) : null; };
  const openSet = () => [...catalog().querySelectorAll("[data-group][data-state=open]")].map((g) => g.dataset.group).sort();
  const ids = [...catalog()?.querySelectorAll("a") ?? []].map((a) => a.getAttribute("href").slice(1)).filter((id) => document.getElementById(id));
  const ancestors = (id) => {
    const out = [];
    const a = catalog().querySelector(`a[href="#${id}"]`);
    for (let g = a && a.closest("[data-group]"); g; g = g.parentElement.closest("[data-group]")) if (g.dataset.group !== id) out.push(g.dataset.group);
    return out.sort();
  };
  const expectedCurrent = () => { let c = ids[0]; for (const id of ids) if (document.getElementById(id).getBoundingClientRect().top <= LINE()) c = id; return c; };
  const atTop = (id) => { const el = document.getElementById(id); return Math.abs(el.getBoundingClientRect().top - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0)) <= 2; };
  const shown = (el) => !!el && getComputedStyle(el).display !== "none" && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().right > 0;
  const click = (el) => el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
  const noHash = (what) => expect(location.hash === "", `${what}: URL kept a hash (${location.href})`);
  const land = async (id) => { document.getElementById(id).scrollIntoView(); scrollBy(0, 2); await wait(250); };
  const sidebar = document.querySelector("[data-slot=sidebar][data-state]");
  const openBtn = () => document.querySelector("[data-catalog-open]");
  if (location.search.includes("reloaded-closed")) {
    expect(sidebar?.dataset.state === "collapsed", "reload: a catalog closed before the reload came back open");
    expect(shown(openBtn()), "reload: no button to reopen the closed catalog");
    document.cookie = "sidebar_state=; max-age=0; path=/";
    return fails;
  }
  const checkSpy = (where) => {
    const c = cur(), e = expectedCurrent();
    expect(c === e, `${where}: spy marks #${c}, expected #${e}`);
    expect(JSON.stringify(openSet()) === JSON.stringify(ancestors(e)), `${where}: open groups ${openSet()} != ancestors of #${e} ${ancestors(e)}`);
    const a = curA();
    if (a) {
      const r = a.getBoundingClientRect(), s = catalog().getBoundingClientRect();
      expect(r.top >= s.top - 1 && r.bottom <= s.bottom + 1, `${where}: current link is outside the catalog's visible area`);
    }
  };

  const hashTarget = new URLSearchParams(location.search).get("expect");
  if (hashTarget) {
    noHash("hash on load");
    expect(atTop(hashTarget), `hash on load: #${hashTarget} is not at the top`);
    expect(cur() === hashTarget, `hash on load: spy marks #${cur()}, expected #${hashTarget}`);
    return fails;
  }

  if (sidebar) {
    expect(shown(catalog()), "wide: the catalog is not visible");
    expect(!shown(openBtn()), "wide: the open button shows while the catalog is open");
    for (const id of ["auth-rhc-s-provider", "auth-rhc-s-login-pkce", "auth-rhc-s-risk", "auth-codex", "auth-grok-build"]) {
      await land(id);
      checkSpy(`scroll to #${id}`);
    }
    click(catalog().querySelector('a[href="#auth-grok-bot"]')); await wait(250);
    noHash("catalog click");
    expect(atTop("auth-grok-bot"), "catalog click: #auth-grok-bot is not at the top");
    checkSpy("after catalog click");

    await land("auth-rhc-s-store");
    const group = "auth-rhc-s-login";
    const caret = () => catalog().querySelector(`[data-group="${group}"] > [data-sidebar="menu-action"]`);
    expect(!openSet().includes(group), `caret: #${group} is open before its caret is clicked`);
    click(caret()); await wait(150);
    expect(caret().getAttribute("aria-expanded") === "true" && openSet().includes(group), `caret: #${group} did not open`);
    await land("auth-rhc-s-provider");
    expect(openSet().includes(group), "caret: a caret-opened group closed when the section changed");
    click(caret()); await wait(150);
    expect(!openSet().includes(group), `caret: a second click did not close #${group}`);

    const x = document.querySelector(".doc").appendChild(Object.assign(document.createElement("a"), { href: "#auth-codex" }));
    click(x); await wait(250);
    x.remove();
    noHash("link in the text");
    expect(cur() === expectedCurrent(), "link in the text: spy is stale after the jump");

    click(document.querySelector("[data-catalog-close]")); await wait(350);
    expect(sidebar.dataset.state === "collapsed" && !shown(catalog()), "collapse: the catalog did not close");
    expect(document.cookie.includes("sidebar_state=false"), "collapse: the closed state was not stored");
    expect(shown(openBtn()), "collapse: no button to reopen the catalog");
    click(openBtn()); await wait(350);
    expect(sidebar.dataset.state === "expanded" && shown(catalog()), "expand: the catalog did not reopen");
    expect(document.cookie.includes("sidebar_state=true"), "expand: the open state was not stored");
  } else {
    const btn = openBtn();
    expect(shown(btn), "narrow: the catalog button is hidden, so the catalog is unreachable");
    [...document.querySelectorAll(".doc h2[id], .doc h3[id]")].pop().scrollIntoView(); await wait(250);
    click(btn); await wait(350);
    const dialog = () => document.querySelector("[role=dialog] [data-catalog]");
    const sheet = () => dialog()?.closest("[role=dialog]");
    expect(shown(dialog()), "sheet: the button did not open the catalog");
    const here = dialog()?.querySelector("a[aria-current]")?.getBoundingClientRect();
    const box = dialog()?.getBoundingClientRect();
    expect(here && here.top >= box.top && here.bottom <= box.bottom, "sheet: the current link is scrolled out of view when the sheet opens");
    expect(btn.getAttribute("aria-expanded") === "true", "sheet: aria-expanded is not true");
    expect(sheet()?.contains(document.activeElement), "sheet: focus did not move into the catalog");
    click(dialog().querySelector('a[href="#auth-grok-bot"]')); await wait(350);
    expect(!dialog(), "sheet: a link click did not close it");
    expect(atTop("auth-grok-bot"), "sheet link: #auth-grok-bot is not at the top");
    noHash("sheet link");
    click(btn); await wait(350);
    document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); await wait(350);
    expect(!dialog(), "sheet: Escape did not close it");
  }
  expect(document.documentElement.scrollWidth <= document.documentElement.clientWidth, "page scrolls sideways");
  document.cookie = "sidebar_state=; max-age=0; path=/";
  return fails;
})()

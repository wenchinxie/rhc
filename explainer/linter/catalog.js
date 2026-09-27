(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const fails = [];
  const expect = (ok, msg) => { if (!ok) fails.push(msg); };
  const toc = document.querySelector("nav.toc");
  const body = document.body;
  const LINE = () => innerHeight * 0.28;
  const curA = () => toc.querySelector("a[aria-current]");
  const cur = () => { const a = curA(); return a ? a.getAttribute("href").slice(1) : null; };
  const openSet = () => [...toc.querySelectorAll(".toc-group.open")].map((g) => g.querySelector("a").getAttribute("href").slice(1)).sort();
  const ids = [...toc.querySelectorAll("a")].map((a) => a.getAttribute("href").slice(1)).filter((id) => document.getElementById(id));
  const ancestors = (id) => {
    const out = [];
    let a = toc.querySelector(`a[href="#${id}"]`);
    for (let g = a && a.parentElement.closest(".toc-group"); g; g = g.parentElement.closest(".toc-group")) {
      if (g.querySelector(":scope > a") !== a) out.push(g.querySelector(":scope > a").getAttribute("href").slice(1));
    }
    return out.sort();
  };
  const expectedCurrent = () => { let c = ids[0]; for (const id of ids) if (document.getElementById(id).getBoundingClientRect().top <= LINE()) c = id; return c; };
  const atTop = (id) => { const el = document.getElementById(id); return Math.abs(el.getBoundingClientRect().top - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0)) <= 2; };
  const shown = (el) => !!el && getComputedStyle(el).display !== "none" && el.getBoundingClientRect().width > 0;
  const click = (el) => el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
  const noHash = (what) => expect(location.hash === "", `${what}: URL kept a hash (${location.href})`);
  const land = async (id) => { document.getElementById(id).scrollIntoView(); scrollBy(0, 2); await wait(250); };
  const checkSpy = (where) => {
    const c = cur(), e = expectedCurrent();
    expect(c === e, `${where}: spy marks #${c}, expected #${e}`);
    expect(JSON.stringify(openSet()) === JSON.stringify(ancestors(e)), `${where}: open groups ${openSet()} != ancestors of #${e} ${ancestors(e)}`);
    const a = curA();
    if (a && body.classList.contains("rail-on")) {
      const r = a.getBoundingClientRect(), s = toc.querySelector(".toc-scroll").getBoundingClientRect();
      expect(r.top >= s.top - 1 && r.bottom <= s.bottom + 1, `${where}: current link is outside the rail's visible area`);
    }
  };

  const hashTarget = new URLSearchParams(location.search).get("expect");
  if (hashTarget) {
    noHash("hash on load");
    expect(atTop(hashTarget), `hash on load: #${hashTarget} is not at the top`);
    expect(cur() === hashTarget, `hash on load: spy marks #${cur()}, expected #${hashTarget}`);
    return fails;
  }

  if (body.classList.contains("rail-on")) {
    expect(!shown(document.getElementById("tocbtn")), "rail on: the sheet button is visible");
    for (const id of ["auth-rhc-s-provider", "auth-rhc-s-login-pkce", "auth-rhc-s-risk", "model-codex", "tools-grok-build"]) {
      await land(id);
      checkSpy(`scroll to #${id}`);
    }
    click(toc.querySelector('a[href="#session"]')); await wait(250);
    noHash("catalog click");
    expect(atTop("session"), "catalog click: #session is not at the top");
    checkSpy("after catalog click");

    const caret = toc.querySelector('a[href="#model"]').parentElement.querySelector(":scope > .toc-tg");
    click(caret); await wait(100);
    expect(caret.getAttribute("aria-expanded") === "true" && openSet().includes("model"), "caret: #model did not open");
    await land("auth-rhc-s-provider");
    expect(openSet().includes("model"), "caret: a caret-opened group closed when the section changed");
    click(caret); await wait(100);
    expect(!openSet().includes("model"), "caret: a second click did not close #model");

    const x = document.querySelector('.doc a[href^="#"]');
    click(x); await wait(250);
    noHash("link in the text");
    expect(cur() === expectedCurrent(), "link in the text: spy is stale after the jump");

    const tg = document.getElementById("railtg");
    click(tg); await wait(100);
    expect(body.classList.contains("rail-closed") && !shown(toc.querySelector(".toc-scroll")), "collapse: the rail did not close");
    expect(localStorage.getItem("rail-closed") === "1", "collapse: the closed state was not stored");
    expect(tg.getAttribute("aria-label") === "展開目錄", "collapse: button label did not switch");
    click(tg); await wait(100);
    expect(!body.classList.contains("rail-closed") && shown(toc.querySelector(".toc-scroll")), "expand: the rail did not reopen");
    expect(localStorage.getItem("rail-closed") === "", "expand: the open state was not stored");
  } else {
    const btn = document.getElementById("tocbtn");
    expect(shown(btn), "rail off: the sheet button is hidden, so the catalog is unreachable");
    click(btn); await wait(100);
    expect(body.classList.contains("toc-open") && shown(toc), "sheet: the button did not open the catalog");
    expect(btn.getAttribute("aria-expanded") === "true", "sheet: aria-expanded is not true");
    expect(toc.contains(document.activeElement), "sheet: focus did not move into the catalog");
    click(toc.querySelector('a[href="#model"]')); await wait(250);
    expect(!body.classList.contains("toc-open"), "sheet: a link click did not close it");
    expect(document.activeElement === btn, "sheet: focus did not return to the button");
    noHash("sheet link");
    click(btn); await wait(100);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); await wait(100);
    expect(!body.classList.contains("toc-open"), "sheet: Escape did not close it");
  }
  expect(document.documentElement.scrollWidth <= document.documentElement.clientWidth, "page scrolls sideways");
  localStorage.removeItem("rail-closed");
  return fails;
})()

(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const fails = [];
  const expect = (ok, msg) => { if (!ok) fails.push(msg); };
  const press = (key) => document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
  const sheet = () => document.querySelector("[data-source-sheet]");
  const shown = (el) => !!el && el.getBoundingClientRect().width > 0 && getComputedStyle(el).visibility !== "hidden";

  const peek = document.querySelector(".doc button[data-snip]");
  expect(peek, "peek: no in-text source button");
  if (peek) {
    peek.scrollIntoView({ block: "center" }); await wait(100);
    document.activeElement?.blur(); peek.click(); await wait(600);
    const s = sheet();
    expect(shown(s), "sheet: clicking a source button did not open it");
    expect(s?.querySelector("h2")?.textContent.trim(), "sheet: no title");
    const rows = s?.querySelectorAll("pre [data-line]") ?? [];
    expect(rows.length > 0, "sheet: no code lines");
    expect(/^\d+$/.test(rows[0]?.querySelector("[data-ln]")?.textContent ?? ""), "sheet: code lines have no line numbers");
    expect(s?.querySelector("pre [data-hi]"), "sheet: the cited lines are not highlighted");
    expect(s?.querySelector("pre [data-syn]"), "sheet: no syntax colouring");
    expect(s?.contains(document.activeElement), "sheet: focus did not move into it");
    press("Escape"); await wait(600);
    expect(!shown(sheet()), "sheet: Escape did not close it");
    expect(document.activeElement === peek, "sheet: focus did not return to the source button");
  }

  const node = document.querySelector(".react-flow [data-snip]");
  expect(node, "flow: no step node carries a source");
  if (node) {
    node.scrollIntoView({ block: "center" }); await wait(200);
    document.activeElement?.blur(); node.click(); await wait(600);
    expect(shown(sheet()), "flow: clicking a step node did not open the sheet");
    press("Escape"); await wait(600);
    expect(document.activeElement === node, "flow: focus did not return to the step node");
    node.focus(); press("Enter"); await wait(600);
    expect(shown(sheet()), "flow: Enter on a step node did not open the sheet");
    press("Escape"); await wait(600);
  }

  const term = document.querySelector(".doc button[data-gloss]");
  expect(term, "gloss: no glossary term");
  if (term) {
    term.scrollIntoView({ block: "center" }); await wait(100);
    term.focus(); term.click(); await wait(400);
    const card = document.querySelector("[data-gloss-card]");
    expect(shown(card), "gloss: clicking a term did not open its card");
    expect(card?.querySelector("[data-gloss-title]")?.textContent.trim() && card?.querySelector("[data-gloss-text]")?.textContent.trim(), "gloss: the card is empty");
    const r = card?.getBoundingClientRect(), t = term.getBoundingClientRect();
    expect(r && r.top >= t.bottom - 1 && r.right <= innerWidth, "gloss: the card is not placed under the term inside the viewport");
    press("Escape"); await wait(400);
    expect(!shown(document.querySelector("[data-gloss-card]")), "gloss: Escape did not close the card");
  }
  expect(document.documentElement.scrollWidth <= document.documentElement.clientWidth, "page scrolls sideways");
  return fails;
})()

// Screenshots the explainer across its layouts and states, and diffs each shot against a saved baseline.
// Usage: bun linter/visual.ts --baseline   (capture from the current checkout into .visual/baseline)
//        bun linter/visual.ts              (capture into .visual/current and diff, exit 1 on any changed pixel)
import { join } from "node:path";
import { mkdirSync, readdirSync, rmSync, existsSync } from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const root = join(import.meta.dir, "..");
const mode = process.argv.includes("--baseline") ? "baseline" : "current";
const only = process.argv.find((a) => a.startsWith("--case="))?.slice(7);
const outDir = join(root, ".visual", mode);
const diffDir = join(root, ".visual", "diff");

type Case = { name: string; w: number; h: number; dark?: boolean; full?: boolean; setup?: string };
const CASES: Case[] = [
  { name: "1440-light", w: 1440, h: 900, full: true },
  { name: "1920-light", w: 1920, h: 1000, full: true },
  { name: "900-sheet", w: 900, h: 800, full: true },
  { name: "1440-dark", w: 1440, h: 900, dark: true, full: true },
  { name: "rail-closed", w: 1440, h: 900, setup: `document.getElementById("railtg").click()` },
  { name: "sheet-open", w: 900, h: 800, setup: `document.getElementById("tocbtn").click()` },
  { name: "src-pane", w: 1440, h: 900, setup: `document.querySelector("[data-snip]").click()` },
  { name: "src-pane-dark", w: 1440, h: 900, dark: true, setup: `document.querySelector("[data-snip]").click()` },
  { name: "gloss", w: 1440, h: 900, setup: `(() => { const t = document.querySelector("[data-gloss]"); t.scrollIntoView({ block: "center" }); t.click(); })()` },
  { name: "rail-deep", w: 1440, h: 900, setup: `document.getElementById("model-codex").scrollIntoView()` },
];

const FREEZE = `*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}`;

const port = 3900 + Math.floor(Math.random() * 90);
const base = `http://127.0.0.1:${port}/`;
const server = Bun.spawn(["bun", "--preload", "./mdx-plugin.ts", "src/index.ts"], {
  cwd: root,
  env: { ...process.env, PORT: String(port), NODE_ENV: "development" },
  stdout: "ignore",
  stderr: "ignore",
});
const cdpPort = 9300 + Math.floor(Math.random() * 500);
const chrome = Bun.spawn(
  ["google-chrome", "--headless=new", "--disable-gpu", "--no-first-run", "--hide-scrollbars", "--font-render-hinting=none",
    `--remote-debugging-port=${cdpPort}`, "about:blank"],
  { stderr: "ignore" },
);

let failed = 0;
try {
  for (let i = 0; i < 100; i++) {
    if (await fetch(base).then((r) => r.ok, () => false)) break;
    await Bun.sleep(100);
  }
  let targets: { type: string; webSocketDebuggerUrl: string }[] = [];
  for (let i = 0; i < 50 && !targets.length; i++) {
    await Bun.sleep(100);
    targets = await fetch(`http://127.0.0.1:${cdpPort}/json`).then((r) => r.json()).catch(() => []);
    targets = targets.filter((t) => t.type === "page");
  }
  const ws = new WebSocket(targets[0]!.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map<number, (v: any) => void>();
  const errors: string[] = [];
  ws.onmessage = (m) => {
    const msg = JSON.parse(String(m.data));
    if (msg.id && pending.has(msg.id)) pending.get(msg.id)!(msg);
    if (msg.method === "Runtime.exceptionThrown") errors.push(msg.params.exceptionDetails.exception?.description?.split("\n")[0]);
  };
  const send = (method: string, params = {}) =>
    new Promise<any>((r) => {
      const n = ++id;
      pending.set(n, r);
      ws.send(JSON.stringify({ id: n, method, params }));
    });
  const evaluate = async (expression: string) =>
    (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;
  await send("Runtime.enable");
  await send("Page.enable");

  for (const c of CASES.filter((c) => !only || c.name === only)) {
    const dir = join(outDir, c.name);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    await send("Emulation.setDeviceMetricsOverride", { width: c.w, height: c.h, deviceScaleFactor: 1, mobile: false });
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: c.dark ? "dark" : "light" }] });
    await evaluate("try { localStorage.clear() } catch {}");
    await send("Page.navigate", { url: base });
    await Bun.sleep(2500);
    await evaluate(`document.head.insertAdjacentHTML("beforeend", "<style>${FREEZE}</style>"); document.fonts.ready.then(() => 1)`);
    if (c.setup) {
      await evaluate(c.setup);
      await Bun.sleep(400);
    }
    const height: number = c.full ? await evaluate("document.documentElement.scrollHeight") : c.h;
    const shots = c.full ? Math.ceil(height / c.h) : 1;
    for (let i = 0; i < shots; i++) {
      if (c.full) {
        await evaluate(`window.scrollTo(0, ${i * c.h})`);
        await Bun.sleep(150);
      }
      const shot = await send("Page.captureScreenshot", { format: "png" });
      await Bun.write(join(dir, `${String(i).padStart(3, "0")}.png`), Buffer.from(shot.result.data, "base64"));
    }
    if (c.full) await Bun.write(join(dir, "height.txt"), String(height));
  }
  ws.close();
  for (const e of errors) console.log(`FAIL page error: ${e}`);
  failed += errors.length;

  if (mode === "current") {
    rmSync(diffDir, { recursive: true, force: true });
    for (const c of CASES.filter((c) => !only || c.name === only)) {
      const bdir = join(root, ".visual", "baseline", c.name);
      const cdir = join(outDir, c.name);
      if (!existsSync(bdir)) {
        console.log(`FAIL ${c.name}: no baseline`);
        failed++;
        continue;
      }
      const bh = existsSync(join(bdir, "height.txt")) ? await Bun.file(join(bdir, "height.txt")).text() : "";
      const ch = existsSync(join(cdir, "height.txt")) ? await Bun.file(join(cdir, "height.txt")).text() : "";
      if (bh !== ch) {
        console.log(`FAIL ${c.name}: page height ${bh} → ${ch}`);
        failed++;
      }
      let changed = 0;
      for (const f of readdirSync(bdir).filter((f) => f.endsWith(".png"))) {
        if (!existsSync(join(cdir, f))) {
          console.log(`FAIL ${c.name}/${f}: missing`);
          failed++;
          continue;
        }
        const a = PNG.sync.read(Buffer.from(await Bun.file(join(bdir, f)).arrayBuffer()));
        const b = PNG.sync.read(Buffer.from(await Bun.file(join(cdir, f)).arrayBuffer()));
        const diff = new PNG({ width: a.width, height: a.height });
        const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0, includeAA: true });
        if (n) {
          mkdirSync(join(diffDir, c.name), { recursive: true });
          await Bun.write(join(diffDir, c.name, f), PNG.sync.write(diff));
          console.log(`FAIL ${c.name}/${f}: ${n} px`);
          changed++;
        }
      }
      failed += changed;
      if (!changed && bh === ch) console.log(`ok ${c.name}`);
    }
  }
} finally {
  chrome.kill();
  server.kill();
}
if (mode === "baseline") console.log(`visual: baseline written to .visual/baseline`);
else console.log(failed ? `visual: ${failed} problem(s), diffs in .visual/diff` : "visual: PASS (zero changed pixels)");
process.exit(failed ? 1 : 0);

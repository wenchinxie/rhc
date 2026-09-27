// Starts its own explainer server and checks the left catalog's rules in headless Chrome.
// Exits 1 with one line per broken rule. Usage: bun linter/catalog.ts
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const port = 3900 + Math.floor(Math.random() * 90);
const base = `http://127.0.0.1:${port}`;
const server = Bun.spawn(["bun", "--preload", "./mdx-plugin.ts", "src/index.ts"], {
  cwd: root,
  env: { ...process.env, PORT: String(port), NODE_ENV: "development" },
  stdout: "ignore",
  stderr: "ignore",
});

const CASES = [
  { size: "1440x900", path: "/" },
  { size: "1280x800", path: "/" },
  { size: "900x800", path: "/" },
  { size: "1440x900", path: "/?expect=auth-rhc-s-risk#auth-rhc-s-risk" },
];

let failed = 0;
try {
  for (let i = 0; i < 100; i++) {
    if (await fetch(base).then((r) => r.ok, () => false)) break;
    await Bun.sleep(100);
  }
  for (const c of CASES) {
    const run = Bun.spawnSync(["bun", "linter/probe.ts", base + c.path, c.size, "linter/catalog.js"], { cwd: root });
    const label = `${c.size} ${c.path}`;
    let out: { console_errors: string[]; value: string[] | { exception: string } };
    try {
      out = JSON.parse(run.stdout.toString());
    } catch {
      console.log(`FAIL ${label}: probe did not return JSON\n${run.stderr.toString()}`);
      failed++;
      continue;
    }
    const problems = [
      ...out.console_errors.map((e) => `console error: ${e}`),
      ...(Array.isArray(out.value) ? out.value : [`lint threw: ${out.value?.exception}`]),
    ];
    for (const p of problems) console.log(`FAIL ${label}: ${p}`);
    failed += problems.length;
  }
} finally {
  server.kill();
}
console.log(failed ? `lint:catalog: ${failed} problem(s)` : `lint:catalog: PASS (${CASES.length} cases)`);
process.exit(failed ? 1 : 0);

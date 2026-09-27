import { renderToString } from "react-dom/server";

(globalThis as { window?: unknown }).window = globalThis;
(globalThis as { document?: unknown }).document = { querySelector: () => null };
const { Site, GLOSS, SRC_MAP } = await import("../src/Site");

const problems: string[] = [];
const orig = console.error;
console.error = (...args: unknown[]) => {
  problems.push(args.map(String).join(" ").split("\n")[0] ?? "");
};
const html = renderToString(<Site />);
console.error = orig;
const nested = (html.match(/<p><p/g) ?? []).length;
if (nested) problems.push(`${nested} nested <p> in rendered HTML`);
for (const [, key] of html.matchAll(/data-gloss="([^"]+)"/g)) if (!GLOSS[key!]) problems.push(`Term "${key}" has no glossary entry`);
for (const [, key] of html.matchAll(/data-snip="([^"]+)"/g)) if (!SRC_MAP[key!]) problems.push(`source "${key}" is not in src-map.json`);
for (const p of problems) console.log("FAIL:", p);
console.log(problems.length ? `lint:render: ${problems.length} problem(s)` : `lint:render: PASS (${html.length} chars)`);
process.exit(problems.length ? 1 : 0);

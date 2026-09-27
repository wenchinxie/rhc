import { renderToString } from "react-dom/server";

(globalThis as { window?: unknown }).window = globalThis;
(globalThis as { document?: unknown }).document = { querySelector: () => null };
const { Site } = await import("../src/Site");

const problems: string[] = [];
const orig = console.error;
console.error = (...args: unknown[]) => {
  problems.push(args.map(String).join(" ").split("\n")[0] ?? "");
};
const html = renderToString(<Site />);
console.error = orig;
const nested = (html.match(/<p><p/g) ?? []).length;
if (nested) problems.push(`${nested} nested <p> in rendered HTML`);
for (const p of problems) console.log("FAIL:", p);
console.log(problems.length ? `lint:render: ${problems.length} problem(s)` : `lint:render: PASS (${html.length} chars)`);
process.exit(problems.length ? 1 : 0);

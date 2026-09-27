// Checks every FlowDag data file: ids referenced by path and branches exist, phases exist,
// each phase keeps its path steps contiguous, and every snip resolves in the folder's src-map.json.
import { Glob } from "bun";
import { dirname, join } from "node:path";
import type { Flow } from "../src/components/FlowDag";

const src = join(import.meta.dir, "..", "src");
const problems: string[] = [];
let count = 0;
for await (const file of new Glob("**/flow{,s}.ts").scan(src)) {
  const mod = await import(join(src, file));
  const map = await Bun.file(join(src, dirname(file), "src-map.json")).json().catch(() => ({}));
  for (const [name, flow] of Object.entries(mod) as [string, Flow][]) {
    if (!flow?.steps || !flow.path) continue;
    count++;
    const at = `${file} ${name}`;
    const ids = new Set(flow.steps.map((s) => s.id));
    const phases = new Set(flow.phases.map((p) => p.id));
    for (const id of [...flow.path, ...flow.branches.flatMap((e) => [e.s, e.t])])
      if (!ids.has(id)) problems.push(`${at}: unknown step ${id}`);
    for (const s of flow.steps) {
      if (!phases.has(s.phase)) problems.push(`${at}: ${s.id} has unknown phase ${s.phase}`);
      if (s.snip && !(s.snip in map)) problems.push(`${at}: ${s.id} snip ${s.snip} is not in src-map.json`);
    }
    const order = flow.path.map((id) => flow.steps.find((s) => s.id === id)?.phase);
    const seen = new Set<string>();
    order.forEach((p, i) => {
      if (p && p !== order[i - 1] && seen.has(p)) problems.push(`${at}: phase ${p} is split along the path`);
      if (p) seen.add(p);
    });
  }
}
for (const p of problems) console.log(`FAIL ${p}`);
console.log(problems.length ? `lint:flows: ${problems.length} problem(s)` : `lint:flows: PASS (${count} flows)`);
process.exit(problems.length ? 1 : 0);

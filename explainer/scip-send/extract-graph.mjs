#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { scip } = require("@sourcegraph/scip-typescript/dist/src/scip.js");

const HERE = dirname(fileURLToPath(import.meta.url));
const DEF = 1;

const SEED_NAMES = new Set([
  "sendPrompt",
  "sendPromptOnce",
  "dispatchUserTurn",
  "enqueueExclusiveRun",
  "runTurn",
  "runTurnLoop",
  "executeStepWithMetrics",
  "handle",
  "run",
]);

const NOISE = new Set([
  "get",
  "set",
  "now",
  "log",
  "trim",
  "filter",
  "map",
  "push",
  "delete",
  "add",
  "find",
  "catch",
  "error",
  "some",
  "all",
  "min",
  "max",
  "floor",
  "round",
  "isFinite",
  "isArray",
  "entries",
  "warn",
  "end",
  "pop",
  "peek",
  "at",
  "info",
  "length",
  "disarm",
]);

function methodName(symbol) {
  const after = symbol.includes("`") ? symbol.slice(symbol.lastIndexOf("`") + 1) : symbol;
  const m = after.match(/(?:#|\/)([A-Za-z_][A-Za-z0-9_]*)\(\)\.?$/);
  if (!m) return null;
  return m[1];
}

function shortFile(rel) {
  const m = String(rel).match(/source\/(.+)$/);
  return m ? m[1] : String(rel).replace(/^file:\/\//, "");
}

function isFnDef(symbol) {
  return methodName(symbol) != null;
}

function isSeed(symbol, file) {
  const n = methodName(symbol);
  if (!n || !SEED_NAMES.has(n)) return false;
  if (n === "run") return /sand-agent-runner/.test(file) || /SandAgentRunner/.test(symbol);
  if (n === "handle") return /user-message-action-handler/.test(file);
  return true;
}

const buf = readFileSync(join(HERE, "index.scip"));
const idx = scip.Index.deserializeBinary(buf);

function pos(r) {
  return (r[0] ?? 0) * 1e6 + (r[1] ?? 0);
}

function contains(enc, range) {
  if (!enc || enc.length < 3) return false;
  const a = pos(enc);
  const b = enc.length >= 4 ? pos([enc[2], enc[3]]) : pos([enc[0], enc[2]]);
  const x = pos(range);
  return x >= a && x <= b;
}

const defs = [];
const refs = [];
for (const doc of idx.documents) {
  const file = shortFile(doc.relative_path);
  for (const occ of doc.occurrences) {
    if (!isFnDef(occ.symbol)) continue;
    const rec = {
      symbol: occ.symbol,
      file,
      range: [...occ.range],
      enc: [...occ.enclosing_range],
      name: methodName(occ.symbol),
    };
    if (occ.symbol_roles & DEF) defs.push(rec);
    else refs.push(rec);
  }
}

function enclosingDef(file, range) {
  const cands = defs.filter((d) => d.file === file && contains(d.enc, range));
  if (!cands.length) return null;
  cands.sort((a, b) => pos(b.enc) - pos(a.enc));
  return cands[0];
}

const edges = [];
const seen = new Set();
for (const r of refs) {
  const caller = enclosingDef(r.file, r.range);
  const callee = defs.find((d) => d.symbol === r.symbol) ?? r;
  if (!caller || caller.symbol === callee.symbol) continue;
  const k = `${caller.symbol}\t${callee.symbol}`;
  if (seen.has(k)) continue;
  seen.add(k);
  edges.push({ from: caller, to: callee, file: r.file });
}

const seedSyms = new Set(
  defs.filter((d) => isSeed(d.symbol, d.file)).map((d) => d.symbol),
);
for (const e of edges) {
  if (isSeed(e.from.symbol, e.from.file) || isSeed(e.to.symbol, e.to.file)) {
    seedSyms.add(e.from.symbol);
    seedSyms.add(e.to.symbol);
  }
}

function interesting(side) {
  if (!side.file || !side.name) return false;
  if (NOISE.has(side.name)) return false;
  if (side.name.length <= 3) return false;
  if (isSeed(side.symbol, side.file)) return true;
  return /host\/|packages\/agent/.test(side.file);
}

const keep = edges.filter(
  (e) =>
    (isSeed(e.from.symbol, e.from.file) || isSeed(e.to.symbol, e.to.file)) &&
    interesting(e.from) &&
    interesting(e.to),
);

const nodeMap = new Map();
function nodeOf(side) {
  if (!nodeMap.has(side.symbol)) {
    nodeMap.set(side.symbol, {
      id: `n${nodeMap.size}`,
      name: side.name,
      file: side.file,
      line: (side.range[0] ?? 0) + 1,
      seed: isSeed(side.symbol, side.file),
    });
  }
  return nodeMap.get(side.symbol);
}

const nodes = [];
const outEdges = [];
for (const e of keep) {
  const a = nodeOf(e.from);
  const b = nodeOf(e.to);
  if (!nodes.includes(a)) nodes.push(a);
  if (!nodes.includes(b)) nodes.push(b);
  outEdges.push({ from: a.id, to: b.id });
}

for (const d of defs) {
  if (isSeed(d.symbol, d.file) && !nodeMap.has(d.symbol)) {
    const n = nodeOf(d);
    if (!nodes.includes(n)) nodes.push(n);
  }
}

const DISPLAY = new Set([
  "sendPrompt",
  "sendPromptOnce",
  "dispatchUserTurn",
  "runTurn",
  "run",
  "handle",
  "runTurnLoop",
  "executeStepWithMetrics",
  "runStep",
]);

const shown = nodes.filter((n) => DISPLAY.has(n.name) && (n.seed || DISPLAY.has(n.name)));
const shownIds = new Set(shown.map((n) => n.id));
const shownEdges = outEdges.filter((e) => shownIds.has(e.from) && shownIds.has(e.to));
const fan = {};
for (const e of keep) {
  const a = nodeOf(e.from);
  if (!shownIds.has(a.id)) continue;
  fan[a.id] = (fan[a.id] ?? 0) + 1;
}
for (const n of shown) n.scipCallees = fan[n.id] ?? 0;

const graph = {
  generated: "2026-08-30",
  tool: "scip-typescript 0.4.0",
  clone: "/mnt/e/grok-bot-0.18-reconstructed",
  documents: idx.documents.length,
  indexedFns: defs.length,
  nodes: shown,
  edges: shownEdges,
};

const out = join(HERE, "../src/harnesses/grok-bot/scip-graph.json");
writeFileSync(out, JSON.stringify(graph, null, 2));
console.log("docs", idx.documents.length, "fn-defs", defs.length);
console.log("display nodes", shown.length, "edges", shownEdges.length);
for (const n of shown) {
  console.log(`${n.seed ? "*" : " "} ${n.name}  ${n.file}:${n.line}  callees=${n.scipCallees}`);
}
for (const e of shownEdges) {
  const a = shown.find((n) => n.id === e.from);
  const b = shown.find((n) => n.id === e.to);
  console.log(`  ${a?.name} -> ${b?.name}`);
}

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import {
  Background,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
  useUpdateNodeInternals,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ELK, { type ElkNode } from "elkjs/lib/elk.bundled.js";
import { BaseNode } from "@/components/base-node";
import { AnimatedSvgEdge } from "@/components/animated-svg-edge";
import { NodeStatusIndicator } from "@/components/node-status-indicator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFolderKey } from "../folder";

/** `ask` is a branch point, `exit` ends the flow off the main path, `fail` ends it with an error. */
export type FlowKind = "step" | "ask" | "exit" | "fail";
export type FlowStep = {
  id: string;
  phase: string;
  label: string;
  kind?: FlowKind;
  /** Function or file under the label. */
  sub?: string;
  /** Who acts, printed at the top right. */
  who?: string;
  /** src-map key, without the folder prefix. */
  snip?: string;
};
export type FlowEdge = { s: string; t: string; label?: string };
export type Flow = {
  label: string;
  phases: { id: string; label: string }[];
  steps: FlowStep[];
  /** The main path in order; its edges are drawn without being listed. */
  path: string[];
  /** Label on the path edge leaving a step, keyed by that step. */
  pathLabels?: Record<string, string>;
  branches: FlowEdge[];
};

const elk = new ELK();

type Dir = "DOWN" | "RIGHT";
type Status = "initial" | "loading" | "success";
type StepData = { step: FlowStep; status: Status; dir: Dir; snip?: string };
type Layout = { dir: Dir; pos: Map<string, { x: number; y: number }>; w: number; h: number };
type Sizes = Map<string, { width: number; height: number }>;

const KIND_CLASS: Record<FlowKind, string> = {
  step: "border-l-4 border-l-pen",
  ask: "border-2 border-dashed border-ink-3",
  exit: "border-ink-3 bg-paper-2",
  fail: "border-rose-600 text-rose-800 dark:text-rose-300",
};

function StepNode({ data }: NodeProps<Node<StepData>>) {
  const { step, dir, snip } = data;
  return (
    <NodeStatusIndicator status={data.status} variant="border">
      <BaseNode
        className={cn(
          "min-h-16 w-[300px] bg-paper text-ink",
          KIND_CLASS[step.kind ?? "step"],
          snip && "cursor-pointer hover:ring-2 hover:ring-pen",
        )}
        data-snip={snip}
        tabIndex={snip ? 0 : undefined}
        role={snip ? "button" : undefined}
      >
        <Handle className="!opacity-0" type="target" position={dir === "DOWN" ? Position.Top : Position.Left} />
        <div className="flex items-baseline justify-between gap-2 px-2.5 pt-1.5 pb-0.5">
          <span className="text-[17px] leading-snug font-bold">
            {step.kind === "ask" ? "◇ " : ""}
            {step.label}
          </span>
          {step.who ? <span className="text-xs whitespace-nowrap text-ink-3">{step.who}</span> : null}
        </div>
        {step.sub ? <div className="px-2.5 pb-2 font-code text-[13px] text-ink-3">{step.sub}</div> : null}
        <Handle className="!opacity-0" type="source" position={dir === "DOWN" ? Position.Bottom : Position.Right} />
      </BaseNode>
    </NodeStatusIndicator>
  );
}

type LinkData = { phase: string; step: string; dir: Dir; onJump: () => void };

/** Where a phase hands off: the phase and the step the edge continues to. Clicking it opens that phase. */
function LinkNode({ data }: NodeProps<Node<LinkData>>) {
  return (
    <button
      type="button"
      onClick={data.onJump}
      className="flex w-[240px] cursor-pointer items-center gap-2 rounded-full border-2 border-dashed border-pen bg-pen-tint px-3.5 py-2 text-left text-ink hover:bg-paper-2"
    >
      <Handle className="!opacity-0" type="target" position={data.dir === "DOWN" ? Position.Top : Position.Left} />
      <span className="text-lg text-pen-ink">→</span>
      <span className="leading-snug">
        <span className="block text-xs text-pen-ink">接到 {data.phase}</span>
        <span className="block text-[15px] font-bold">{data.step}</span>
      </span>
    </button>
  );
}

const nodeTypes = { step: StepNode, link: LinkNode };
const edgeTypes = { animated: AnimatedSvgEdge };

function flowEdges(flow: Flow): FlowEdge[] {
  const main = flow.path.slice(1).map((t, i) => ({ s: flow.path[i]!, t, label: flow.pathLabels?.[flow.path[i]!] }));
  return [...main, ...flow.branches];
}

async function layout(sizes: Sizes, edges: FlowEdge[], dir: Dir): Promise<Layout> {
  const g: ElkNode = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": dir,
      "elk.layered.spacing.nodeNodeBetweenLayers": "56",
      "elk.spacing.nodeNode": "32",
      "elk.edgeRouting": "ORTHOGONAL",
    },
    children: [...sizes].map(([id, size]) => ({ id, ...size })),
    edges: edges.map((e) => ({ id: `${e.s}-${e.t}`, sources: [e.s], targets: [e.t] })),
  };
  const out = await elk.layout(g);
  return {
    dir,
    pos: new Map((out.children ?? []).map((c) => [c.id, { x: c.x ?? 0, y: c.y ?? 0 }])),
    w: out.width ?? 0,
    h: out.height ?? 0,
  };
}

/** Lays the phase out both ways, from the node sizes React Flow measured, and keeps the direction that fits the canvas at the larger scale. */
function useFittedLayout(sizes: Sizes | null, edges: FlowEdge[], box: { w: number; h: number } | null): Layout | null {
  const [both, setBoth] = useState<Layout[] | null>(null);
  useEffect(() => {
    if (sizes) Promise.all([layout(sizes, edges, "DOWN"), layout(sizes, edges, "RIGHT")]).then(setBoth);
  }, [sizes]);
  if (!both || !box) return null;
  const scale = (l: Layout) => Math.min(box.w / l.w, box.h / l.h);
  return both.reduce((a, b) => (scale(b) > scale(a) ? b : a));
}

function useBoxSize(ref: RefObject<HTMLElement | null>) {
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e!.contentRect.width, h: e!.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return box;
}

const linkId = (target: string) => `to-${target}`;

function PhaseCanvas(props: { flow: Flow; steps: string[]; at: number; onJump: (phase: string) => void }) {
  const { flow, steps, at } = props;
  const ref = useRef<HTMLDivElement>(null);
  const box = useBoxSize(ref);
  const all = flowEdges(flow);
  const leaving = all.filter((e) => steps.includes(e.s) && !steps.includes(e.t));
  const links = [...new Set(leaving.map((e) => e.t))];
  const ids = [...steps, ...links.map(linkId)];
  const edges = [
    ...all.filter((e) => steps.includes(e.s) && steps.includes(e.t)),
    ...leaving.map((e) => ({ ...e, t: linkId(e.t) })),
  ];
  const view = useReactFlow();
  const folderKey = useFolderKey();
  const byId = new Map(flow.steps.map((s) => [s.id, s]));
  const phaseLabel = new Map(flow.phases.map((p) => [p.id, p.label]));
  const dataOf = (id: string, dir: Dir): StepData | LinkData => {
    const target = links.find((t) => linkId(t) === id);
    if (target) {
      const to = byId.get(target)!;
      return { phase: phaseLabel.get(to.phase)!, step: to.label, dir, onJump: () => props.onJump(to.phase) };
    }
    const step = byId.get(id)!;
    const i = flow.path.indexOf(id);
    const status: Status = i < 0 ? "initial" : i < at ? "success" : i === at ? "loading" : "initial";
    return { step, status, dir, snip: step.snip && folderKey(step.snip) };
  };
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(
    ids.map((id) => ({ id, type: steps.includes(id) ? "step" : "link", position: { x: 0, y: 0 }, style: { opacity: 0 }, data: dataOf(id, "DOWN") })),
  );
  const [sizes, setSizes] = useState<Sizes | null>(null);
  useEffect(() => {
    if (sizes || !nodes.every((n) => n.measured?.width && n.measured.height)) return;
    setSizes(new Map(nodes.map((n) => [n.id, { width: n.measured!.width!, height: n.measured!.height! }])));
  }, [nodes]);
  const fit = useFittedLayout(sizes, edges, box);
  const current = flow.path[at]!;
  const prev = flow.path[at - 1];
  const updateInternals = useUpdateNodeInternals();
  useEffect(() => {
    if (fit) updateInternals(ids);
  }, [fit?.dir]);
  useEffect(() => {
    if (fit) requestAnimationFrame(() => view.fitView({ padding: 0.06, maxZoom: 1.4 }));
  }, [fit, box?.w, box?.h]);
  useEffect(() => {
    setNodes((ns) =>
      ns.map((n) => ({
        ...n,
        data: dataOf(n.id, fit?.dir ?? "DOWN"),
        position: fit?.pos.get(n.id) ?? n.position,
        style: fit ? undefined : n.style,
      })),
    );
  }, [fit, at]);
  const drawn: Edge[] = edges.map((e) => {
    const live = e.s === prev && (e.t === current || e.t === linkId(current));
    const bad = byId.get(e.t)?.kind === "fail";
    return {
      id: `${e.s}-${e.t}`,
      source: e.s,
      target: e.t,
      label: e.label,
      type: live ? "animated" : "smoothstep",
      data: live ? { duration: 1.2, path: "smoothstep", shape: "circle" } : undefined,
      style: bad
        ? { stroke: "var(--color-rose-600)", strokeDasharray: "4 3" }
        : live
          ? { stroke: "var(--pen)", strokeWidth: 2.5 }
          : undefined,
    } as Edge;
  });
  return (
    <div ref={ref} className="h-[clamp(20rem,calc(100svh-9rem),46rem)] rounded-md border border-line-strong bg-paper">
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={fit ? drawn : []}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        zoomOnScroll={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
      </ReactFlow>
    </div>
  );
}

/** A flow split into phases; each phase is a small DAG laid out to fit the viewport, stepped through along its main path. */
export function FlowDag({ flow }: { flow: Flow }) {
  const [at, setAt] = useState(0);
  const [open, setOpen] = useState(flow.phases[0]!.id);
  const phaseOf = new Map(flow.steps.map((s) => [s.id, s.phase]));
  const ids = flow.steps.filter((s) => s.phase === open).map((s) => s.id);
  const go = (i: number) => {
    setAt(i);
    setOpen(phaseOf.get(flow.path[i]!)!);
  };
  return (
    <figure className="wide my-6" aria-label={flow.label}>
      <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
        {flow.phases.length > 1
          ? flow.phases.map((p, i) => (
              <span key={p.id} className="flex items-center gap-1.5">
                {i > 0 ? <span className="mx-0.5 text-ink-3">→</span> : null}
                <button
                  type="button"
                  className={cn(
                    "cursor-pointer rounded-md border border-line-strong bg-paper px-3 py-1.5 text-[length:var(--fs-sm)] leading-tight",
                    p.id === open && "border-pen font-bold text-pen-ink",
                  )}
                  onClick={() => setOpen(p.id)}
                >
                  {p.label}
                  <small className="block text-[length:var(--fs-2xs)] font-normal text-ink-3">
                    {flow.steps.filter((s) => s.phase === p.id && (s.kind ?? "step") !== "fail" && s.kind !== "exit").length} 步
                  </small>
                </button>
              </span>
            ))
          : null}
        <span className="ml-auto flex items-center gap-3">
          <Button variant="outline" size="sm" disabled={at === 0} onClick={() => go(at - 1)}>
            上一步
          </Button>
          <span className="font-code text-[length:var(--fs-xs)] text-ink-3">
            {at + 1} / {flow.path.length}
          </span>
          <Button variant="outline" size="sm" disabled={at === flow.path.length - 1} onClick={() => go(at + 1)}>
            下一步
          </Button>
        </span>
      </div>
      <ReactFlowProvider key={open}>
        <PhaseCanvas flow={flow} steps={ids} at={at} onJump={setOpen} />
      </ReactFlowProvider>
    </figure>
  );
}

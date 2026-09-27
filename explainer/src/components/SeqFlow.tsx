import { useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";

export type SeqActor = { id: string; label: string; sub?: string };
export type SeqStep = {
  from: string;
  to: string;
  label: string;
  fn?: string[];
  detail: string;
  snip?: string;
};
export type SeqFlowData = { title: string; actors: SeqActor[]; steps: SeqStep[] };

/**
 * A sequence diagram you step through: one lane per actor, one arrow per step,
 * the function that runs it under the arrow. Every step's detail panel is
 * rendered and only the active one is shown, so each data-snip attribute is
 * written once and FolderDoc's slug prefix on it survives re-renders.
 */
export function SeqFlow({ flow }: { flow: SeqFlowData }) {
  const [active, setActive] = useState(0);
  const col = new Map(flow.actors.map((a, i) => [a.id, i]));
  const n = flow.actors.length;
  const last = flow.steps.length - 1;
  return (
    <figure className="seq wide" style={{ "--seq-cols": n } as CSSProperties}>
      <figcaption className="seq-title">{flow.title}</figcaption>
      <div className="overflow">
        <div className="seq-grid">
          <div className="seq-head">
            {flow.actors.map((a) => (
              <div key={a.id} className="seq-actor">
                <b>{a.label}</b>
                {a.sub ? <code>{a.sub}</code> : null}
              </div>
            ))}
          </div>
          <div className="seq-body">
            {flow.actors.map((a, i) => (
              <span key={a.id} className="seq-life" style={{ left: `${((i + 0.5) / n) * 100}%` }} />
            ))}
            {flow.steps.map((s, i) => {
              const a = col.get(s.from)!;
              const b = col.get(s.to)!;
              const lo = Math.min(a, b);
              const span = Math.abs(b - a) + 1;
              const kind = a === b ? "self" : b > a ? "right" : "left";
              return (
                <button
                  key={i}
                  type="button"
                  className={i === active ? "seq-row on" : i < active ? "seq-row done" : "seq-row"}
                  onClick={() => setActive(i)}
                  aria-pressed={i === active}
                >
                  <span
                    className={`seq-arrow ${kind}`}
                    style={{ gridColumn: `${lo + 1} / span ${span}`, "--inset": `${50 / span}%` } as CSSProperties}
                  >
                    <span className="seq-label">
                      <i>{i + 1}</i>
                      {s.label}
                    </span>
                    <span className="seq-line" />
                    {s.fn?.length ? <code className="seq-fn">{s.fn[0]}</code> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="seq-ctl">
        <Button variant="outline" size="sm" disabled={active === 0} onClick={() => setActive(active - 1)}>
          上一步
        </Button>
        <span className="seq-count">
          {active + 1} / {flow.steps.length}
        </span>
        <Button variant="outline" size="sm" disabled={active === last} onClick={() => setActive(active + 1)}>
          下一步
        </Button>
      </div>
      {flow.steps.map((s, i) => (
        <div key={i} className="seq-detail" hidden={i !== active}>
          <p className="seq-detail-h">
            <i>{i + 1}</i>
            {s.label}
          </p>
          <p>{s.detail}</p>
          {s.fn?.length || s.snip ? (
            <p className="seq-detail-fn">
              {s.fn?.map((f) => (
                <code key={f}>{f}</code>
              ))}
              {s.snip ? (
                <button type="button" className="peek" data-snip={s.snip}>
                  看原文
                </button>
              ) : null}
            </p>
          ) : null}
        </div>
      ))}
    </figure>
  );
}

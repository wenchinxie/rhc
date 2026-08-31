import type { ReactNode } from "react";

export function Xfer(props: {
  title: string;
  cells: { lab: string; body: ReactNode }[];
}) {
  return (
    <article className="xfer">
      <div className="xfer-head">
        <p className="name">{props.title}</p>
      </div>
      <div className="xfer-grid">
        {props.cells.map((c) => (
          <div key={c.lab} className="xfer-cell">
            <div className="lab">{c.lab}</div>
            <p>{c.body}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

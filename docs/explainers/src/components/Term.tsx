import type { ReactNode } from "react";

export function Term(props: { k: string; children: ReactNode }) {
  return (
    <button
      type="button"
      className="term"
      data-gloss={props.k}
      aria-haspopup="dialog"
      aria-expanded="false"
    >
      {props.children}
      <span className="term-q" aria-hidden="true">
        ?
      </span>
    </button>
  );
}

import type { ReactNode } from "react";
import { Peek } from "./components/Peek";
import { Term } from "./components/Term";

export { Peek, Term };

export function H2(props: { id: string; n: string; children: ReactNode }) {
  return (
    <h2 id={props.id}>
      <span className="no">{props.n}</span>
      {props.children}
    </h2>
  );
}

export function H3(props: { id: string; n: string; children: ReactNode }) {
  return (
    <h3 id={props.id}>
      <span className="no">{props.n}</span>
      {props.children}
    </h3>
  );
}

export const mdxComponents = { H2, H3, Term, Peek };

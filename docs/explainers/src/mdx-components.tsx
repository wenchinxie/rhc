import type { ReactNode } from "react";
import { Peek } from "./components/Peek";
import { Term } from "./components/Term";
import { Xfer } from "./components/Xfer";

export { Peek, Term, Xfer };

export function Apex(props: { children: ReactNode }) {
  return <section className="apex wide">{props.children}</section>;
}

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

export function Dag(props: { svg: string }) {
  return (
    <figure id="map">
      <div
        className="overflow dagbox wide"
        dangerouslySetInnerHTML={{ __html: props.svg }}
      />
    </figure>
  );
}

export const mdxComponents = { Apex, H2, H3, Term, Peek, Dag, Xfer };

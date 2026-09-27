import type { ReactNode } from "react";
import { Peek } from "./components/Peek";
import { Term } from "./components/Term";

export { Peek, Term };

export function H2(props: { id: string; n: string; children: ReactNode }) {
  return (
    <h2
      id={props.id}
      className="not-prose relative clear-both mt-20 mb-4 scroll-mt-8 border-t-2 border-ink pt-5 text-[length:var(--fs-h2)] leading-[1.28] font-extrabold"
    >
      <span className="mr-[0.7em] font-code text-[0.8em] font-normal text-pen-ink md:absolute md:top-[1.35rem] md:right-full md:mr-0 md:pr-3.5 md:text-[1.8em] md:leading-none md:font-light md:tabular-nums">
        {props.n}
      </span>
      {props.children}
    </h2>
  );
}

export function H3(props: { id: string; n: string; children: ReactNode }) {
  return (
    <h3
      id={props.id}
      className="not-prose mt-11 mb-3 scroll-mt-8 text-[length:var(--fs-h3)] leading-[1.36] font-[750]"
    >
      <span className="mr-2 font-code text-[0.88em] font-normal text-ink-3">{props.n}</span>
      {props.children}
    </h3>
  );
}

export const mdxComponents = { H2, H3, Term, Peek };

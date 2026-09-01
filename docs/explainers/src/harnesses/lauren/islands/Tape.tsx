import { Term } from "../../../components/Term";
import { TalkTranscript, type Seg } from "../../grok-bot/TalkTranscript";
import talk from "../../grok-bot/lauren-talk.quotes.json";
import copy from "../copy.json";

export function Tape() {
  const quotes = talk.quotes as Seg[];
  return (
    <>
      {copy.tapeLede ? (
        <p>
          {copy.tapeLede}{" "}
          <Term k="pstack">Pstack</Term>、
          <Term k="glass">Glass</Term>、
          <Term k="feature-map">功能地圖</Term>、
          <Term k="benny">Benny</Term>、
          <Term k="dune">Dune</Term>
          的定義按 ?。
        </p>
      ) : null}
      {copy.blocks.map((c) => (
        <section key={c.id} className="tape-cut">
          <h2 id={c.id}>
            <span className="no">{c.n}</span>
            {c.title}
          </h2>
          <p>
            <span className="when">{c.when}</span>
            {c.body}
          </p>
          <TalkTranscript
            key={`${c.id}-q`}
            segments={quotes.filter((q) => q.block === c.id)}
          />
        </section>
      ))}
    </>
  );
}

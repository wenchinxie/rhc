import { Apex } from "../../../mdx-components";
import { TalkTranscript, type Seg } from "../../grok-bot/TalkTranscript";
import talk from "../../grok-bot/lauren-talk.quotes.json";
import type { LaurenCopy } from "../copy-types";

export function LangPack(props: { copy: LaurenCopy; lang: "zh" | "en" }) {
  const { copy, lang } = props;
  const quotes = talk.quotes as Seg[];
  const L = copy.labels;
  return (
    <div lang={lang === "zh" ? "zh-Hant" : "en"}>
      <Apex>
        <p className="tldr">{L.background}</p>
        <p>{copy.background}</p>
        <p className="tldr">{L.see}</p>
        <p>{copy.problem}</p>
        <ol className="enum">
          {copy.problemItems.map((item, i) => (
            <li key={item.title}>
              <span className="n">{i + 1}</span>
              <strong>{item.title}</strong>
              <span className="d">{item.why}</span>
            </li>
          ))}
        </ol>
        <p className="tldr">{L.did}</p>
        <ol className="enum">
          {copy.solutions.map((s) => (
            <li key={s.title}>
              <span className="n">{s.mapsTo}</span>
              <strong>{s.title}</strong>
              <span className="d">
                {L.mapsTo} {s.mapsTo}. {s.process} {s.reason}
              </span>
            </li>
          ))}
        </ol>
      </Apex>
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
            lang={lang}
            segments={quotes.filter((q) => q.block === c.id)}
          />
        </section>
      ))}
    </div>
  );
}

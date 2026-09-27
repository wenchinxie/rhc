import copy from "../copy.json";
import tweets from "../tweets.json";

const CAPTIONS = copy.xCaptions as Record<string, string>;

export function XThreads() {
  return (
    <section className="tape-cut">
      <h2 id="x">{copy.xH2}</h2>
      <p>{copy.xLede}</p>
      {tweets.posts.map((p) => (
        <article key={p.id} className="xfer" id={`x-${p.id}`}>
          <p className="src">
            {p.date} · {p.user} ·{" "}
            <a className="xref" href={p.url}>
              {p.url.replace("https://", "")}
            </a>
          </p>
          <blockquote className="tweet">{p.text}</blockquote>
          <p>{CAPTIONS[p.id]}</p>
        </article>
      ))}
    </section>
  );
}

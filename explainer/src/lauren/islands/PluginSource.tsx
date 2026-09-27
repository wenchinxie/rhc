import type { LaurenCopy } from "../copy-types";

export function PluginSource(props: { copy: LaurenCopy }) {
  const p = props.copy.plugin;
  return (
    <section className="tape-cut">
      <h2 id="plugin">{p.title}</h2>
      <p>{p.lede}</p>
      <p className="src">
        <a className="xref" href={p.url}>
          {p.url.replace("https://", "")}
        </a>
      </p>
    </section>
  );
}

import { GROUPS } from "./catalog";

export function IndexPage() {
  return (
    <article className="doc harness-index">
      <header>
        <h1>Explainers</h1>
        <p className="mast-note">
          這份索引按切面排。觀測、port、開機各進一節，不是按文件名掃。
        </p>
      </header>
      {GROUPS.map((group) => (
        <section className="aspect-group" key={group.id}>
          <div className="k">{group.kicker}</div>
          <h2>{group.title}</h2>
          <ul className="harness-list">
            {group.aspects.map((aspect) => (
              <li key={aspect.slug}>
                <a href={aspect.href}>
                  <strong>{aspect.title}</strong>
                  <p>{aspect.question}</p>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
}

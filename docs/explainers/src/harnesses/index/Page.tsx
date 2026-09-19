import { GROUPS } from "./catalog";

export function IndexPage() {
  return (
    <article className="doc harness-index">
      <header>
        <h1>Explainers</h1>
        <p className="mast-note">
          0.18 與 0.47 分開讀。演進頁只講兩者差在哪。
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

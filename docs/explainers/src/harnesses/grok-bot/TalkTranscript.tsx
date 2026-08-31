export type Seg = {
  id: string;
  start: number;
  end: number;
  t: string;
  text: string;
  was?: string;
};

export function TalkTranscript(props: { segments: Seg[] }) {
  return (
    <ol className="talk">
      {props.segments.map((s) => (
        <li key={s.id} id={s.id}>
          <a className="ts" href={`#${s.id}`}>
            {s.t}
          </a>
          <span>
            {s.text}
            {s.was ? (
              <span className="fix" title={s.was}>
                改
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ol>
  );
}

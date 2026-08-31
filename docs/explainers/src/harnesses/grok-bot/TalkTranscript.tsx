export type Seg = {
  id: string;
  start: number;
  end: number;
  t: string;
  text: string;
  en?: string;
  block?: string;
};

export function TalkTranscript(props: { segments: Seg[] }) {
  return (
    <div className="talk">
      {props.segments.map((s) => (
        <p key={s.id} id={s.id} className="tape" title={s.en}>
          <a className="ts" href={`#${s.id}`}>
            {s.t}
          </a>
          {s.text}
        </p>
      ))}
    </div>
  );
}

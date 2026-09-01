export type Seg = {
  id: string;
  start: number;
  end: number;
  t: string;
  text: string;
  en?: string;
  block?: string;
};

export function TalkTranscript(props: { segments: Seg[]; lang?: "zh" | "en" }) {
  const lang = props.lang ?? "zh";
  return (
    <div className="talk">
      {props.segments.map((s) => {
        const body = lang === "en" ? (s.en ?? s.text) : s.text;
        const hover = lang === "en" ? s.text : s.en;
        return (
          <p key={s.id} id={s.id} className="tape" title={hover}>
            <a className="ts" href={`#${s.id}`}>
              {s.t}
            </a>
            {body}
          </p>
        );
      })}
    </div>
  );
}

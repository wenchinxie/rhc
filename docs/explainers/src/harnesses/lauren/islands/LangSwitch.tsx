type Lang = "zh" | "en";

export function LangSwitch(props: {
  lang: Lang;
  onChange: (lang: Lang) => void;
  label: string;
}) {
  return (
    <div className="lang-switch" role="group" aria-label={props.label}>
      <button
        type="button"
        aria-pressed={props.lang === "zh"}
        onClick={() => props.onChange("zh")}
      >
        中文
      </button>
      <button
        type="button"
        aria-pressed={props.lang === "en"}
        onClick={() => props.onChange("en")}
      >
        English
      </button>
    </div>
  );
}

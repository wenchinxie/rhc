import { useFolderKey } from "../folder";
import { useOpenSource } from "./SourceSheet";

export function Peek(props: { snip: string; children: string }) {
  const key = useFolderKey()(props.snip);
  const open = useOpenSource();
  return (
    <button
      type="button"
      data-snip={key}
      onClick={(ev) => open(key, ev.currentTarget)}
      className="mx-[.25em] inline-flex cursor-pointer items-baseline gap-[.28em] rounded-full border border-line-strong px-[.5em] pt-[.06em] pb-[.1em] text-[length:var(--fs-2xs)] font-semibold whitespace-nowrap text-ink-2 hover:border-ink-3 hover:bg-paper-2 hover:text-ink focus-visible:border-ink-3 focus-visible:bg-paper-2 focus-visible:text-ink focus-visible:outline-none"
    >
      {props.children}
      <span aria-hidden="true" className="font-bold text-ink-3">
        ›
      </span>
    </button>
  );
}

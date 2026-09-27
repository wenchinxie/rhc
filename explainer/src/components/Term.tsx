import { createContext, useContext, useId, type ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFolderKey } from "../folder";

export type GlossEntry = { t: string; d: string; avoid?: string[] };

export const Gloss = createContext<Record<string, GlossEntry>>({});

export function Term(props: { k: string; children: ReactNode }) {
  const key = useFolderKey()(props.k);
  const entry = useContext(Gloss)[key];
  const titleId = useId();
  const term = (
    <button
      type="button"
      data-gloss={key}
      className="cursor-pointer rounded-[2px] border-b border-pen-line bg-pen-tint px-[.12em] hover:bg-pen-line"
    >
      {props.children}
      <span aria-hidden="true" className="ml-[.12em] align-super font-code text-[.72em] text-pen-ink">
        ?
      </span>
    </button>
  );
  if (!entry) return term;
  return (
    <Popover>
      <PopoverTrigger asChild>{term}</PopoverTrigger>
      <PopoverContent
        data-gloss-card
        aria-labelledby={titleId}
        align="start"
        className="w-auto max-w-[22rem] border-line bg-paper px-4 py-3 text-ink"
      >
        <p id={titleId} data-gloss-title className="mb-1 font-bold">
          {entry.t}
        </p>
        <p data-gloss-text className="text-sm leading-[1.7] text-ink-2">
          {entry.d}
        </p>
      </PopoverContent>
    </Popover>
  );
}

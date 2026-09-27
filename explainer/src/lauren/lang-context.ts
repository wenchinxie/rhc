import { createContext, useContext } from "react";
import type { LaurenCopy } from "./copy-types";

export type LaurenLang = "zh" | "en";

export type LaurenLangValue = {
  lang: LaurenLang;
  copy: LaurenCopy;
};

export const LaurenLangContext = createContext<LaurenLangValue | null>(null);

export function useLaurenLang(): LaurenLangValue {
  const v = useContext(LaurenLangContext);
  if (!v) throw new Error("LaurenLangContext missing");
  return v;
}

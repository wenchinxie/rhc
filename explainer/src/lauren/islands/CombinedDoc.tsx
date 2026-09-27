import { useLaurenLang } from "../lang-context";
import { LangPack } from "./LangPack";
import { PluginSource } from "./PluginSource";
import { VideoBadge } from "./VideoBadge";

export function CombinedDoc() {
  const { lang, copy } = useLaurenLang();
  return (
    <>
      <VideoBadge />
      <PluginSource copy={copy} />
      <LangPack copy={copy} lang={lang} />
    </>
  );
}

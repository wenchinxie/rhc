import { useEffect, useState } from "react";
import { MDXProvider } from "@mdx-js/react";
import { ExplainerShell } from "../../ExplainerShell";
import { mdxComponents } from "../../mdx-components";
import { GLOSS } from "./gloss";
import zh from "./copy.json";
import en from "./copy.en.json";
import srcMap from "./src-map.json";
import Doc from "./page.mdx";
import { LaurenLangContext, type LaurenLang } from "./lang-context";
import { LangSwitch } from "./islands/LangSwitch";

const KEY = "rhc-lauren-lang";

function readLang(): LaurenLang {
  try {
    return localStorage.getItem(KEY) === "en" ? "en" : "zh";
  } catch {
    return "zh";
  }
}

function applyLang(lang: LaurenLang) {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    /* file:// private mode */
  }
  document.documentElement.lang = lang === "en" ? "en" : "zh-Hant";
  document.body.classList.remove("toc-open");
  document.getElementById("tocbtn")?.setAttribute("aria-expanded", "false");
}

const SRC_MAP_JSON = JSON.stringify(srcMap).replace(/</g, "\\u003c");

export function LaurenPage() {
  const [lang, setLang] = useState<LaurenLang>(readLang);
  const copy = lang === "en" ? en : zh;
  const onLang = (next: LaurenLang) => {
    setLang(next);
    applyLang(next);
  };
  const switcher = () => (
    <LangSwitch lang={lang} label={copy.labels.lang} onChange={onLang} />
  );

  useEffect(() => {
    applyLang(lang);
  }, [lang]);

  const toc = [
    { href: "#video", label: copy.labels.video },
    { href: "#plugin", label: copy.labels.plugin },
    ...copy.blocks.map((b) => ({
      href: `#${b.id}`,
      n: b.n,
      label: b.title,
    })),
  ];

  return (
    <LaurenLangContext.Provider value={{ lang, copy }}>
      <ExplainerShell
        title={copy.title}
        subtitle={copy.subtitle}
        kicker={copy.kicker}
        mastNote={copy.mastNote}
        toc={toc}
        tocLabel={copy.labels.toc}
        tocLead={switcher()}
        headerExtra={switcher()}
        gloss={GLOSS}
        srcMapJson={SRC_MAP_JSON}
      >
        <MDXProvider components={mdxComponents}>
          <Doc />
        </MDXProvider>
      </ExplainerShell>
    </LaurenLangContext.Provider>
  );
}

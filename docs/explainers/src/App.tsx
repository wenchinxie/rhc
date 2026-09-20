import type { ComponentType } from "react";
import { IndexPage } from "./harnesses/index/Page";
import { GrokBotPage as GrokBot018Page } from "./harnesses/grok-bot/Page";
import { GrokBotPage as GrokBot047Page } from "./harnesses/grok-bot-047/Page";
import { EvolutionPage } from "./harnesses/grok-bot-evolution/Page";
import { LaurenPage } from "./harnesses/lauren/Page";
import { LaurenPageEn } from "./harnesses/lauren/PageEn";
import "./index.css";

const PAGES: Record<string, ComponentType> = {
  "/": IndexPage,
  "/grok-bot": GrokBot018Page,
  "/grok-bot-047": GrokBot047Page,
  "/grok-bot-evolution": EvolutionPage,
  "/lauren": LaurenPage,
  "/lauren-en": LaurenPageEn,
};

function pagePath(pathname: string): string {
  let path = pathname;
  if (path.endsWith(".html")) {
    path = path.slice(0, -".html".length);
  }
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  if (path === "" || path === "/index") {
    return "/";
  }
  return path;
}

export function App() {
  const Page = PAGES[pagePath(window.location.pathname)] ?? IndexPage;
  return <Page />;
}

export default App;

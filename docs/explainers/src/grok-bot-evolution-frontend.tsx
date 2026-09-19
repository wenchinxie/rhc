import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { EvolutionPage } from "./harnesses/grok-bot-evolution/Page";
import "./index.css";

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <EvolutionPage />
  </StrictMode>
);

if (import.meta.hot) {
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  createRoot(elem).render(app);
}

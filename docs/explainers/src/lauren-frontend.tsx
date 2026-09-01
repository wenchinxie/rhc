import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LaurenPage } from "./harnesses/lauren/Page";
import "./index.css";

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <LaurenPage />
  </StrictMode>
);

if (import.meta.hot) {
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  createRoot(elem).render(app);
}

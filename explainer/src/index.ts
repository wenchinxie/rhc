import { serve } from "bun";
import index from "./index.html";

const DOC_PATHS = [
  "/",
  "/index.html",
  "/rhc-auth",
  "/rhc-auth.html",
];

const server = serve({
  port: Number(process.env.PORT) || 3010,
  routes: Object.fromEntries(DOC_PATHS.map((path) => [path, index])),

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`Server running at ${server.url}`);

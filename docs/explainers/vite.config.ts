import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  publicDir: false,
  plugins: [
    { enforce: "pre", ...mdx({ jsxImportSource: "react" }) },
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    port: 5174,
    strictPort: true,
  },
});

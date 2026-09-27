# rhc explainers

One Bun + React app. Shared ivory shell in `src/`. Each page is
`src/<component>/<harness>/page.mdx` (for example `src/auth/codex/`), and `src/Site.tsx`
mounts them under one catalog row per component. React mounts that Markdown. Edit MDX, then
`bun run dev`. The only HTML file is the Bun SPA shell `src/index.html`.

```bash
source ./activate    # cd here, bun install if needed
./activate           # same, then bun run dev
```

Dev server is `http://127.0.0.1:3010`; `bun run dev` runs `bun run check` first: `tsc --noEmit`, then a server-side render of every page that fails on a React error or a nested `<p>`. `linter/flows.ts` checks each login flow's data (`src/auth/*/flow.ts`): known steps and phases, contiguous phases, and every snip present in the folder's `src-map.json`. `bun run lint:catalog` starts its own server and checks the left catalog in headless Chrome (spy, open groups, caret, collapse, sheet, hash-free links). Both live in `linter/` and run as pre-commit hooks on `explainer/` changes; install them once with `uvx pre-commit install` from the repo root. `bun run lint:visual` screenshots ten page states and diffs them against `.visual/baseline`; capture the baseline with `--baseline` on the commit before a style change. `/` is the catalog (`src/Site.tsx`).

Compile a shareable file on demand with artifacts-builder `compile.sh src/index.html`. Do not commit `dist/` or a `docs/<slug>-design.html` snapshot.

# rhc explainers

One Bun + React app. Shared ivory shell in `src/`. Each page is
`src/<component>/<harness>/page.mdx` (for example `src/auth/codex/`), and `src/Site.tsx`
mounts them under one catalog row per component. React mounts that Markdown. Edit MDX, then
`bun run dev`. The only HTML file is the Bun SPA shell `src/index.html`.

```bash
source ./activate    # cd here, bun install if needed
./activate           # same, then bun run dev
```

Dev server is `http://127.0.0.1:3010`; `bun run dev` runs `bun run check` first: `tsc --noEmit`, then a server-side render of every page that fails on a React error or a nested `<p>`. `bun run lint:catalog` starts its own server and checks the left catalog in headless Chrome (spy, open groups, caret, collapse, sheet, hash-free links). Both live in `linter/` and run as pre-commit hooks on `explainer/` changes; install them once with `uvx pre-commit install` from the repo root. `/` is the catalog (`src/Site.tsx`).
Document paths (`/grok-bot`, `/grok-bot-047`, `/lauren`, …) serve the same
shell; `App.tsx` picks the harness from the path.

§0 of a code explainer is the folder map, rendered from `structure.json`:
`python3 ~/.claude/skills/artifacts-builder/scripts/structure_to_s0.py <structure.json> <folders.json> <imports.json> src/<slug>/content` (graphs from `tsgraph.mjs`, see the skill's `references/codebase-map.md`).

Compile a shareable file on demand with artifacts-builder `compile.sh src/index.html`. Do not commit `dist/` or a `docs/<slug>-design.html` snapshot.

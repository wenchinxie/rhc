# rhc explainers

One Bun + React app. Shared ivory shell in `src/`. Each document is
`src/harnesses/<slug>/page.mdx`. React mounts that Markdown. Edit MDX, then
`bun run dev`. The only HTML file is the Bun SPA shell `src/index.html`.

```bash
source ./activate    # cd here, bun install if needed
./activate           # same, then bun run dev
```

Dev server is `http://127.0.0.1:3010`. `/` is the catalog (`harnesses/index/page.mdx`).
Document paths (`/grok-bot`, `/grok-bot-047`, `/lauren`, …) serve the same
shell; `App.tsx` picks the harness from the path.

§0 of a code explainer is the folder map, rendered from `structure.json`:
`python3 ~/.claude/skills/artifacts-builder/scripts/structure_to_s0.py <structure.json> <folders.json> <imports.json> src/harnesses/<slug>/content` (graphs from `tsgraph.mjs`, see the skill's `references/codebase-map.md`).

Compile a shareable file on demand with artifacts-builder `compile.sh src/index.html`. Do not commit `dist/` or a `docs/<slug>-design.html` snapshot.

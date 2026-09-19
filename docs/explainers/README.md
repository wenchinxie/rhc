# rhc explainers

One Bun + React app for harness design pages. Shared ivory shell in `src/`.
`/` is the catalog. Each document is `src/harnesses/<slug>/` plus a sibling
HTML entry (`src/<slug>.html`). Read via bun dev. Compile to `dist/` on
demand. Do not commit a `docs/<slug>-design.html` snapshot.

```bash
source ./activate    # cd here, bun install if needed
./activate           # same, then bun run dev
```

Dev server is `http://127.0.0.1:3010` (`PORT` overrides). Routes: `/` catalog,
`/grok-bot.html`, `/lauren.html`, `/lauren-en.html`.
The catalog at `/` lists aspects, not document names. A new grok-bot
aspect is a row in `src/harnesses/index/catalog.ts` pointing at a
section or a future harness HTML.

§0 of a code explainer is the folder map, rendered from `structure.json`:
`python3 ~/.claude/skills/artifacts-builder/scripts/structure_to_s0.py <structure.json> <folders.json> <imports.json> src/harnesses/<slug>/content` (graphs from `tsgraph.mjs`, see the skill's `references/codebase-map.md`).

Compile if you need a single file: `bash ~/.claude/skills/artifacts-builder/scripts/compile.sh`.
The output stays in `dist/`. Do not copy it into `docs/`.

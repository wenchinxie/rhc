# rhc explainers

One Bun + React app for harness design pages. Shared ivory shell in `src/`;
each document is `src/harnesses/<slug>/`. Reader HTML is compiled out to
`docs/<slug>-design.html`.

```bash
source ./activate    # cd here, bun install if needed
./activate           # same, then bun run dev
```

§0 of a code explainer is the folder map, rendered from `structure.json`:
`python3 ~/.claude/skills/artifacts-builder/scripts/structure_to_s0.py <structure.json> <folders.json> <imports.json> src/harnesses/<slug>/content` (graphs from `tsgraph.mjs`, see the skill's `references/codebase-map.md`).

Compile: `bash ~/.claude/skills/artifacts-builder/scripts/compile.sh`
then copy `dist/bundle.html` to the matching `docs/<slug>-design.html`.

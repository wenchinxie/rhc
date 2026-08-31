# rhc explainers

One Bun + React app for harness design pages. Shared ivory shell in `src/`;
each document is `src/harnesses/<slug>/`. Reader HTML is compiled out to
`docs/<slug>-design.html`.

```bash
source ./activate    # cd here, bun install if needed
./activate           # same, then bun run dev
```

§0 workflow is a `tree_grammar` run tree (not the compact 3-column DAG).
Rebuild the SVG: `python3 scripts/build_grok_bot_dag.py`.

Compile: `bash ~/.grok/skills/artifacts-builder/scripts/compile.sh`
then copy `dist/bundle.html` to the matching `docs/<slug>-design.html`.

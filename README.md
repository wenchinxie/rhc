# rhc

Personal coding-agent harness. I use this tree to change the harness I actually run.

## Status

Empty start (`chore: start empty`, 2026-08-15). Harness design pages live in
`docs/explainers/` (one Bun app; per-harness modules under `src/harnesses/`).
Read them with `source docs/explainers/activate` (bun dev). Do not commit a compiled `docs/<slug>-design.html`.

SuperGrok login lives in `host/extensions/auth` (the Grok Bot host-extension
slot). Browser OAuth (same public client as Grok Build) writes
`~/.rhc/auth.json`. It does not write `~/.grok/auth.json`.

```
cargo run -p rhc --bin rhc -- login
cargo run -p rhc --bin rhc -- whoami
cargo run -p rhc --bin rhc -- models
```

# rhc

Personal coding-agent harness. I use this tree to change the harness I actually run.

## Status

Empty start (`chore: start empty`, 2026-08-15). Harness design pages live in
`docs/explainers/` (one Bun app; per-harness modules under `src/harnesses/`).
Reader HTML is `docs/<slug>-design.html`. `source docs/explainers/activate`.

SuperGrok login is the `xai-oauth` crate. Device-code OAuth (same public client
as Grok Build / OpenClaw) writes `~/.rhc/auth.json`. It does not write
`~/.grok/auth.json`.

```
cargo run -p xai-oauth --bin rhc -- login
cargo run -p xai-oauth --bin rhc -- whoami
```

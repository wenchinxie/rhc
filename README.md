# rhc

Personal coding-agent harness. I use this tree to change the harness I actually run.

## Status

Empty start (`chore: start empty`, 2026-08-15). Harness design pages live in
`docs/explainers/` (one Bun app; per-harness modules under `src/harnesses/`).
Reader HTML is `docs/<slug>-design.html`. `source docs/explainers/activate`.

SuperGrok login lives in `features/xai-oauth/`. It uses xAI device-code OAuth
(the same public client as Grok Build / OpenClaw) and writes `~/.rhc/auth.json`.
It does not write `~/.grok/auth.json`.

```
uv run --project features/xai-oauth rhc login
uv run --project features/xai-oauth rhc whoami
```

# cc-trace

Observe-only Claude Code mod. It logs the system prompt sections, injected
context, tool descriptions, turns, tool calls (full input and result),
subagents, skills, compaction and every appended row, one JSONL file per load.

Output goes to `$CC_TRACE_DIR`, default `/mnt/e/claude-code-notes/cc-trace`.
Never commit the output: it holds Claude Code's prompt text.

It auto-loads in any Claude Code session started in this repo (a plugin in the
project's `.claude/skills/<name>` is loaded and watched). To use it elsewhere:

    claude --plugin-dir ~/rhc/.claude/skills/cc-trace

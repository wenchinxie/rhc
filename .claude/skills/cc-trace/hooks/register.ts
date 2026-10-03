import type { Args, EventResult, Register } from 'claude-code'

// Observe-only: every hook passes `next(e)`'s answer through unchanged.

const DEFAULT_DIR = '/mnt/e/claude-code-notes/cc-trace'
const PREVIEW = 400
const FIELD = 8000
const LONG = 2000
const FLUSH_MS = 2000

type Clipped = string & { readonly __brand: 'Clipped' }

const clip = (s: unknown, n = PREVIEW): Clipped => {
  const t = typeof s === 'string' ? s : JSON.stringify(s) ?? ''
  return (t.length > n ? `${t.slice(0, n)}…(+${t.length - n})` : t) as Clipped
}

const clipStrings = (v: unknown): unknown =>
  typeof v === 'string'
    ? clip(v, FIELD)
    : Array.isArray(v)
      ? v.map(clipStrings)
      : v !== null && typeof v === 'object'
        ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clipStrings(x)]))
        : v

type Section = EventResult<'prompt.compose'>['sections'][number]
type Append = Args<'session.append'>

type TraceRecord =
  | ({ event: 'session.start' } & Pick<Args<'session.start'>, 'cwd' | 'surface' | 'isInteractive'>)
  | ({ event: 'session.end' } & Pick<Args<'session.end'>, 'reason' | 'sessionId'>)
  | { event: 'prompt.submit'; text: Clipped }
  | ({ event: 'prompt.compose' } & Pick<Args<'prompt.compose'>, 'model' | 'tools' | 'traits'> & {
      order: string[]
      changed: Section[]
    })
  | ({ event: 'prompt.context' } & EventResult<'prompt.context'>)
  | { event: 'prompt.attachment'; type: Args<'prompt.attachment'>['type']; text: EventResult<'prompt.attachment'>['text'] }
  | ({ event: 'tool.describe'; tool: Args<'tool.describe'>['tool'] } & Pick<EventResult<'tool.describe'>, 'isDeferred' | 'description'>)
  | ({ event: 'turn.start' } & Pick<Args<'turn.start'>, 'turnId'> & { text: Clipped })
  | ({ event: 'turn.step' } & Pick<Args<'turn.step'>, 'turnId' | 'agentId' | 'index' | 'model' | 'effort' | 'messageCount'> & { ms: number })
  | ({ event: 'turn.complete'; reason: Args<'turn.complete'>['reason'] } & Pick<EventResult<'turn.complete'>, 'usage'> & { text: Clipped })
  | ({ event: 'tool.call'; tool: string; input: unknown; ms: number; result: unknown; text: Clipped } & Pick<
      EventResult<'tool.call'>,
      'deny' | 'isError' | 'isReadOnly'
    >)
  | ({ event: 'agent.spawn' } & Pick<Args<'agent.spawn'>, 'subagentType' | 'description'> & { prompt: Clipped })
  | { event: 'skill.prompt'; skill: Args<'skill.prompt'>['skill']; text: Clipped }
  | ({ event: 'session.compact' } & Pick<Args<'session.compact'>, 'trigger' | 'agentId'> & { messages: number })
  | ({ event: 'session.append' } & Pick<Append, 'door' | 'origin' | 'agentId'> &
      Pick<Append['message'], 'type' | 'name' | 'role'> & { content: Clipped })

export const register: Register = on => {
  const lines: string[] = []
  const seen = new Map<string, string>()
  let path: string | undefined
  let isDirty = false

  const log = (record: TraceRecord) => {
    lines.push(JSON.stringify({ t: new Date().toISOString(), ...record }))
    isDirty = true
  }
  const hasChanged = (key: string, text: string) => {
    if (seen.get(key) === text) return false
    seen.set(key, text)
    return true
  }

  on('session.start', async ($, e, next) => {
    const dir = (await $.env.get('CC_TRACE_DIR')) ?? DEFAULT_DIR
    const out = `${dir}/${new Date().toISOString().replace(/[:.]/g, '-')}.jsonl`
    path = out
    log({ event: 'session.start', cwd: e.cwd, surface: e.surface, isInteractive: e.isInteractive })
    $.clock.every(FLUSH_MS, async () => {
      if (!isDirty) return
      isDirty = false
      await $.fs.write(out, `${lines.join('\n')}\n`)
    })
    $.ui.status(`cc-trace → ${out}`)
    return next(e)
  })

  on('session.end', async ($, e, next) => {
    log({ event: 'session.end', reason: e.reason, sessionId: e.sessionId })
    if (path !== undefined) await $.fs.write(path, `${lines.join('\n')}\n`)
    return next(e)
  })

  on('prompt.submit', ($, e, next) => {
    log({ event: 'prompt.submit', text: clip(e.text) })
    return next(e)
  })

  on('prompt.compose', async ($, e, next) => {
    const r = await next(e)
    log({
      event: 'prompt.compose',
      model: e.model,
      tools: e.tools,
      traits: e.traits,
      order: r.sections.map(s => `${s.scope}:${s.id}`),
      changed: r.sections.filter(s => hasChanged(`section:${s.id}`, s.text)),
    })
    return r
  })

  on('prompt.context', async ($, e, next) => {
    const r = await next(e)
    log({ event: 'prompt.context', blocks: r.blocks })
    return r
  })

  on('prompt.attachment', async ($, e, next) => {
    const r = await next(e)
    log({ event: 'prompt.attachment', type: e.type, text: r.text })
    return r
  })

  on('tool.describe', async ($, e, next) => {
    const r = await next(e)
    if (hasChanged(`tool:${e.tool}`, r.description))
      log({ event: 'tool.describe', tool: e.tool, isDeferred: r.isDeferred, description: r.description })
    return r
  })

  on('turn.start', ($, e, next) => {
    log({ event: 'turn.start', turnId: e.turnId, text: clip(e.text) })
    return next(e)
  })

  on('turn.step', async function* ($, e, next) {
    const started = Date.now()
    const r = yield* next(e)
    log({
      event: 'turn.step',
      turnId: e.turnId,
      agentId: e.agentId,
      index: e.index,
      model: e.model,
      effort: e.effort,
      messageCount: e.messageCount,
      ms: Date.now() - started,
    })
    return r
  })

  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    log({ event: 'turn.complete', reason: e.reason, usage: r.usage, text: clip(r.text) })
    return r
  })

  on('tool.call', async ($, e, next) => {
    const started = Date.now()
    const r = await next(e)
    const { tool, ...input } = e
    log({
      event: 'tool.call',
      tool,
      input: clipStrings(input),
      ms: Date.now() - started,
      deny: r.deny,
      isError: r.isError,
      isReadOnly: r.isReadOnly,
      result: clipStrings(r.result),
      text: clip(r.text, FIELD),
    })
    return r
  })

  on('agent.spawn', async ($, e, next) => {
    log({ event: 'agent.spawn', subagentType: e.subagentType, description: e.description, prompt: clip(e.prompt, LONG) })
    return next(e)
  })

  on('skill.prompt', async ($, e, next) => {
    const r = await next(e)
    log({ event: 'skill.prompt', skill: e.skill, text: clip(r.text, LONG) })
    return r
  })

  on('session.compact', async ($, e, next) => {
    log({ event: 'session.compact', trigger: e.trigger, agentId: e.agentId, messages: e.messages.length })
    return next(e)
  })

  on('session.append', async ($, e, next) => {
    const r = await next(e)
    log({
      event: 'session.append',
      door: e.door,
      origin: e.origin,
      agentId: e.agentId,
      type: e.message.type,
      name: e.message.name,
      role: e.message.role,
      content: clip(e.message.content),
    })
    return r
  })
}

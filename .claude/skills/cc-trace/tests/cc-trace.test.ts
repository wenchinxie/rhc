import { expect, test } from 'claude-code/testing'

test('a tool call answers what the engine answered', async ($, on) => {
  const answer = { result: { stdout: 'ok', stderr: '', interrupted: false } }
  on('tool.call', () => answer)

  const ran = await $.tool.call({ tool: 'Bash', command: 'true' })

  expect(ran.result).toEqual(answer.result)
  expect(ran.deny).toBeUndefined()
})

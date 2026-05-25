import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { deriveTaskName, extractCronLiteral, scanTasksDir } from '../../modules/scheduled-tasks/scan'

describe('extractCronLiteral', () => {
  it('reads the first string-literal arg (single, double, backtick)', () => {
    expect(extractCronLiteral(`export default defineScheduledTask('0 * * * *', {})`)).toBe('0 * * * *')
    expect(extractCronLiteral(`defineScheduledTask("*/5 * * * *", {})`)).toBe('*/5 * * * *')
    expect(extractCronLiteral('defineScheduledTask(`0 0 * * 1`, {})')).toBe('0 0 * * 1')
  })

  it('returns null for a non-scheduled task', () => {
    expect(extractCronLiteral(`export default defineTask({ meta: { name: 'x' } })`)).toBeNull()
  })

  it('does not match the import statement', () => {
    const code = `import { defineScheduledTask } from '~~/server/utils/cron'\nexport default defineTask({})`
    expect(extractCronLiteral(code)).toBeNull()
  })
})

describe('deriveTaskName', () => {
  it('joins path segments under tasksDir with colons, dropping the extension', () => {
    const dir = join('proj', 'server', 'tasks')
    expect(deriveTaskName(join(dir, 'support', 'remindStale.ts'), dir)).toBe('support:remindStale')
    expect(deriveTaskName(join(dir, 'cleanup.ts'), dir)).toBe('cleanup')
  })
})

describe('scanTasksDir', () => {
  let dir: string

  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), 'sched-tasks-'))
    await mkdir(join(dir, 'support'), { recursive: true })
    await writeFile(
      join(dir, 'support', 'remindStale.ts'),
      `import { defineScheduledTask } from '~~/server/utils/cron'\n`
      + `export default defineScheduledTask('0 * * * *', { meta: { name: 'support:remindStale' }, run: async () => ({ result: 'ok' }) })\n`,
    )
    // A plain (manual) task — must be ignored.
    await writeFile(
      join(dir, 'manual.ts'),
      `export default defineTask({ meta: { name: 'manual' }, run: async () => ({ result: 'ok' }) })\n`,
    )
  })

  afterAll(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('collects only scheduled tasks, keyed by cron, with path-derived names', async () => {
    const result = await scanTasksDir(dir)
    expect(result).toEqual({ '0 * * * *': ['support:remindStale'] })
  })

  it('returns an empty map for a missing directory', async () => {
    expect(await scanTasksDir(join(dir, 'does-not-exist'))).toEqual({})
  })
})

import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('writeEnvKeys', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('appends missing keys and updates existing ones without duplicating', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'harness-keys-'))
    const envPath = join(dir, '.env')
    writeFileSync(envPath, 'NUXT_AUTH_SECRET="old"\n', 'utf8')
    vi.spyOn(process, 'cwd').mockReturnValue(dir)
    vi.resetModules()
    const { writeEnvKeys } = await import('../../src/lib/keys')
    const log = writeEnvKeys()
    const content = readFileSync(envPath, 'utf8')
    expect((content.match(/^NUXT_AUTH_SECRET=/gm) ?? []).length).toBe(1)
    expect(content).toContain('NUXT_TASK_SECRET=')
    expect(log.find(l => l.key === 'NUXT_AUTH_SECRET')?.action).toBe('updated')
  })
})

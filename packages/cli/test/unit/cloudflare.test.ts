import type { Runner } from '../../src/lib/run'
import { describe, expect, it, vi } from 'vitest'
import { resolveOrCreateD1, resolveOrCreateKv } from '../../src/lib/cloudflare'

const ok = (stdout: string) => ({ code: 0, stdout, stderr: '' })

describe('resolveOrCreateD1', () => {
  it('parses the uuid from `d1 info --json`', async () => {
    const runner: Runner = vi.fn(async (_c, args) =>
      args.includes('info') ? ok('{"uuid":"db-123"}') : ok(''))
    expect(await resolveOrCreateD1('x', runner)).toBe('db-123')
  })
})

describe('resolveOrCreateKv', () => {
  it('returns the existing namespace id without creating', async () => {
    const runner: Runner = vi.fn(async () => ok('[{"id":"kv-1","title":"x"}]'))
    expect(await resolveOrCreateKv('x', runner)).toBe('kv-1')
    expect((runner as ReturnType<typeof vi.fn>).mock.calls.some((c: unknown[]) => (c[1] as string[]).includes('create'))).toBe(false)
  })
})

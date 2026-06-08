import { beforeEach, describe, expect, it, vi } from 'vitest'

const store = new Map<string, number>()

vi.mock('@nuxthub/kv', () => ({
  kv: {
    get: async (k: string) => store.get(k),
    set: async (k: string, v: number) => void store.set(k, v),
    del: async (k: string) => void store.delete(k),
  },
}))

// createError is a Nitro/h3 auto-import in source; provide it for node-env tests.
vi.stubGlobal('createError', (e: { statusCode: number, statusMessage: string }) =>
  Object.assign(new Error(e.statusMessage), e))

const { assertLoginAllowed, recordLoginFailure, clearLoginFailures } = await import('#layers/auth/server/utils/login-throttle')

describe('login throttle', () => {
  beforeEach(() => store.clear())

  it('allows when under the per-IP limit', async () => {
    await recordLoginFailure('1.1.1.1')
    await expect(assertLoginAllowed('1.1.1.1')).resolves.toBeUndefined()
  })

  it('blocks at the per-IP limit (5 fails)', async () => {
    for (let i = 0; i < 5; i++)
      await recordLoginFailure('2.2.2.2')
    await expect(assertLoginAllowed('2.2.2.2')).rejects.toMatchObject({ statusCode: 429 })
  })

  it('isolates counters per IP', async () => {
    for (let i = 0; i < 5; i++)
      await recordLoginFailure('2.2.2.2')
    await expect(assertLoginAllowed('9.9.9.9')).resolves.toBeUndefined()
  })

  it('clears the IP counter on success', async () => {
    for (let i = 0; i < 5; i++)
      await recordLoginFailure('3.3.3.3')
    await clearLoginFailures('3.3.3.3')
    await expect(assertLoginAllowed('3.3.3.3')).resolves.toBeUndefined()
  })

  it('trips the global breaker independent of any single IP', async () => {
    for (let i = 0; i < 100; i++)
      await recordLoginFailure(`ip-${i}`)
    // A fresh IP is now blocked because the global counter is over the limit.
    await expect(assertLoginAllowed('fresh-ip')).rejects.toMatchObject({ statusCode: 429 })
  })
})

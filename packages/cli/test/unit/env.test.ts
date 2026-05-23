import { describe, expect, it } from 'vitest'
import { resolveCfToken, workerRuntimeSecrets } from '../../src/lib/env'

describe('resolveCfToken', () => {
  it('prefers CLOUDFLARE_API_TOKEN over the others', () => {
    const r = resolveCfToken({ CLOUDFLARE_API_TOKEN: 'a', CLOUDFLARE_TOKEN: 'b' })
    expect(r).toEqual({ token: 'a', source: 'CLOUDFLARE_API_TOKEN' })
  })
  it('falls back to NUXT_HUB token', () => {
    expect(resolveCfToken({ NUXT_HUB_CLOUDFLARE_API_TOKEN: 'x' }).source).toBe('NUXT_HUB_CLOUDFLARE_API_TOKEN')
  })
  it('returns empty when none present', () => {
    expect(resolveCfToken({})).toEqual({})
  })
})

describe('workerRuntimeSecrets', () => {
  it('keeps NUXT_* and CRON_SECRET, drops the rest and empties', () => {
    const out = workerRuntimeSecrets({ NUXT_AUTH_SECRET: 's', CRON_SECRET: 'c', PATH: '/bin', NUXT_EMPTY: '' })
    expect(out).toEqual({ NUXT_AUTH_SECRET: 's', CRON_SECRET: 'c' })
  })
})

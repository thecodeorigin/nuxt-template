import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getRedisBase } from '~~/server/utils/storage'

const ENV_KEYS = ['NUXT_REDIS_BASE', 'VERCEL_ENV', 'VERCEL_GIT_COMMIT_REF'] as const

describe('getRedisBase', () => {
  const original: Record<string, string | undefined> = {}

  beforeEach(() => {
    for (const k of ENV_KEYS) {
      original[k] = process.env[k]
      delete process.env[k]
    }
  })

  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (original[k] === undefined)
        delete process.env[k]
      else
        process.env[k] = original[k]
    }
  })

  it('uses NUXT_REDIS_BASE when set, ignoring everything else', () => {
    process.env.NUXT_REDIS_BASE = 'custom:prefix'
    process.env.VERCEL_ENV = 'production'
    expect(getRedisBase()).toBe('custom:prefix')
  })

  it('returns redis:prod for VERCEL_ENV=production', () => {
    process.env.VERCEL_ENV = 'production'
    expect(getRedisBase()).toBe('redis:prod')
  })

  it('returns redis:preview:<branch-slug> for VERCEL_ENV=preview', () => {
    process.env.VERCEL_ENV = 'preview'
    process.env.VERCEL_GIT_COMMIT_REF = 'feat/Add-Cool-Thing'
    expect(getRedisBase()).toBe('redis:preview:feat-add-cool-thing')
  })

  it('falls back to redis:preview:unknown when branch ref missing', () => {
    process.env.VERCEL_ENV = 'preview'
    expect(getRedisBase()).toBe('redis:preview:unknown')
  })

  it('truncates very long branch slugs to 32 chars', () => {
    process.env.VERCEL_ENV = 'preview'
    process.env.VERCEL_GIT_COMMIT_REF = 'a'.repeat(100)
    const base = getRedisBase()
    expect(base.startsWith('redis:preview:')).toBe(true)
    expect(base.length).toBeLessThanOrEqual('redis:preview:'.length + 32)
  })

  it('returns redis:local when not on Vercel', () => {
    expect(getRedisBase()).toBe('redis:local')
  })
})

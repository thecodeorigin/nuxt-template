import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('encryptSecret / decryptSecret', () => {
  beforeEach(() => {
    vi.stubGlobal('createError', ({ statusCode, statusMessage }: { statusCode: number, statusMessage: string }) =>
      Object.assign(new Error(statusMessage), { statusCode }))
    vi.stubGlobal('useRuntimeConfig', () => ({ authSecret: 'unit-test-secret' }))
  })
  afterEach(() => vi.unstubAllGlobals())

  it('round-trips a plaintext string', async () => {
    const { encryptSecret, decryptSecret } = await import('~~/server/utils/crypto')
    const enc = await encryptSecret('cf-token-abc-123')
    expect(enc.ciphertext).toBeTypeOf('string')
    expect(enc.iv).toBeTypeOf('string')
    expect(await decryptSecret(enc)).toBe('cf-token-abc-123')
  })

  it('produces a fresh IV per call (non-determinism)', async () => {
    const { encryptSecret } = await import('~~/server/utils/crypto')
    const a = await encryptSecret('same-plaintext')
    const b = await encryptSecret('same-plaintext')
    expect(a.iv).not.toBe(b.iv)
    expect(a.ciphertext).not.toBe(b.ciphertext)
  })

  it('fails to decrypt when the secret has rotated', async () => {
    const { encryptSecret } = await import('~~/server/utils/crypto')
    const enc = await encryptSecret('cf-token')

    vi.stubGlobal('useRuntimeConfig', () => ({ authSecret: 'rotated-secret' }))
    const { decryptSecret } = await import('~~/server/utils/crypto')
    await expect(decryptSecret(enc)).rejects.toBeTruthy()
  })

  it('throws when authSecret is not configured', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ authSecret: '' }))
    const { encryptSecret } = await import('~~/server/utils/crypto')
    await expect(encryptSecret('x')).rejects.toMatchObject({ statusCode: 500 })
  })
})

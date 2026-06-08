import { describe, expect, it } from 'vitest'

// Mirrors the inline helpers in server/api/auth/login.post.ts. The compare must
// be constant-time over the email+password pair so neither a wrong email nor a
// wrong password leaks via timing or digest length.
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length)
    return false
  let diff = 0
  for (let i = 0; i < a.length; i++)
    diff |= a[i]! ^ b[i]!
  return diff === 0
}

async function digest(s: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))
}

function pair(email: string, password: string): string {
  return `${email.toLowerCase()}\0${password}`
}

describe('credential compare', () => {
  it('accepts the exact email+password pair', async () => {
    expect(timingSafeEqual(
      await digest(pair('admin@x.dev', 'secret')),
      await digest(pair('admin@x.dev', 'secret')),
    )).toBe(true)
  })

  it('is case-insensitive on the email', async () => {
    expect(timingSafeEqual(
      await digest(pair('Admin@X.Dev', 'secret')),
      await digest(pair('admin@x.dev', 'secret')),
    )).toBe(true)
  })

  it('rejects a wrong password', async () => {
    expect(timingSafeEqual(
      await digest(pair('admin@x.dev', 'nope')),
      await digest(pair('admin@x.dev', 'secret')),
    )).toBe(false)
  })

  it('rejects a wrong email even with the right password', async () => {
    expect(timingSafeEqual(
      await digest(pair('attacker@x.dev', 'secret')),
      await digest(pair('admin@x.dev', 'secret')),
    )).toBe(false)
  })

  it('produces fixed-length digests (no length leak)', async () => {
    const short = await digest(pair('a@b.co', 'x'))
    const long = await digest(pair('areallylongadmin@example.dev', 'averylongpassword123456'))
    expect(short.length).toBe(long.length)
    expect(short.length).toBe(32)
  })
})

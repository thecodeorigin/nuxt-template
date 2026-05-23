import { describe, expect, it } from 'vitest'
import { CreateInvitationSchema } from '#layers/auth/shared/schemas/invitation'

describe('createInvitationSchema', () => {
  it('accepts a valid email and defaults role to member', () => {
    const parsed = CreateInvitationSchema.parse({ email: 'user@example.com' })
    expect(parsed.email).toBe('user@example.com')
    expect(parsed.role).toBe('member')
  })

  it('accepts an explicit admin role', () => {
    const parsed = CreateInvitationSchema.parse({ email: 'a@b.com', role: 'admin' })
    expect(parsed.role).toBe('admin')
  })

  it('trims the email', () => {
    const parsed = CreateInvitationSchema.parse({ email: '  user@example.com  ' })
    expect(parsed.email).toBe('user@example.com')
  })

  it('rejects an invalid email', () => {
    expect(() => CreateInvitationSchema.parse({ email: 'not-an-email' })).toThrow()
  })

  it('rejects an unknown role', () => {
    expect(() => CreateInvitationSchema.parse({ email: 'user@example.com', role: 'owner' })).toThrow()
  })
})

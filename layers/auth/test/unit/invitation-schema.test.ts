import { describe, expect, it } from 'vitest'
import { CreateInvitationSchema } from '#layers/auth/shared/schemas/invitation'

describe('createInvitationSchema', () => {
  it('accepts a valid email with no role_id', () => {
    const parsed = CreateInvitationSchema.parse({ email: 'user@example.com' })
    expect(parsed.email).toBe('user@example.com')
    expect(parsed.role_id).toBeUndefined()
  })

  it('accepts an explicit role_id', () => {
    const parsed = CreateInvitationSchema.parse({ email: 'a@b.com', role_id: 'some-role-uuid' })
    expect(parsed.role_id).toBe('some-role-uuid')
  })

  it('trims the email', () => {
    const parsed = CreateInvitationSchema.parse({ email: '  user@example.com  ' })
    expect(parsed.email).toBe('user@example.com')
  })

  it('rejects an invalid email', () => {
    expect(() => CreateInvitationSchema.parse({ email: 'not-an-email' })).toThrow()
  })

  it('accepts metadata as a record of unknown values', () => {
    const parsed = CreateInvitationSchema.parse({ email: 'a@b.com', metadata: { project_ids: ['id-1', 'id-2'], foo: 42 } })
    expect(parsed.metadata).toEqual({ project_ids: ['id-1', 'id-2'], foo: 42 })
  })

  it('allows metadata to be omitted', () => {
    const parsed = CreateInvitationSchema.parse({ email: 'a@b.com' })
    expect(parsed.metadata).toBeUndefined()
  })

  it('rejects metadata that is not a record', () => {
    expect(() => CreateInvitationSchema.parse({ email: 'a@b.com', metadata: ['not-a-record'] })).toThrow()
  })
})

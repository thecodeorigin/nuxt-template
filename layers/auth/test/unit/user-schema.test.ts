import { describe, expect, it } from 'vitest'
import { NotificationPrefsSchema, UpdateUserSchema } from '#layers/auth/shared/schemas/user'

describe('updateUserSchema', () => {
  it('requires at least one field', () => {
    expect(() => UpdateUserSchema.parse({})).toThrow()
  })
  it('rejects a bad username', () => {
    expect(() => UpdateUserSchema.parse({ username: 'no spaces!' })).toThrow()
  })
  it('rejects an overlong bio', () => {
    expect(() => UpdateUserSchema.parse({ bio: 'a'.repeat(501) })).toThrow()
  })
  it('accepts a partial valid update', () => {
    expect(UpdateUserSchema.parse({ name: 'Ada' })).toEqual({ name: 'Ada' })
  })
})

describe('notificationPrefsSchema', () => {
  it('requires all four booleans', () => {
    expect(() => NotificationPrefsSchema.parse({ email: true })).toThrow()
    expect(NotificationPrefsSchema.parse({ email: true, product_updates: false, weekly_digest: true, important_updates: false }))
      .toEqual({ email: true, product_updates: false, weekly_digest: true, important_updates: false })
  })
})

import type { AuthUser } from '#layers/auth/server/services/auth'
import { describe, expect, it } from 'vitest'
import {
  backupKey,
  IMPERSONATE_ABILITY,
  impersonatorInfoFromSession,
  sessionKey,
} from '#layers/auth/server/services/impersonate'
import { ImpersonateStartSchema } from '#layers/auth/shared/schemas/impersonate'

function makeAdmin(over: Partial<AuthUser> = {}): AuthUser {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    primary_email: 'admin@seed.local',
    primary_phone: null,
    username: 'admin',
    name: 'Seed Admin',
    avatar: null,
    bio: null,
    verified: true,
    provider: 'google',
    abilities: ['user:impersonate', 'user:read'],
    activeOrganizationId: null,
    ...over,
  }
}

describe('impersonate ability constant', () => {
  it('exposes the canonical ability string', () => {
    expect(IMPERSONATE_ABILITY).toBe('user:impersonate')
  })
})

describe('impersonatorInfoFromSession', () => {
  it('extracts identity + abilities for the backup record', () => {
    const admin = makeAdmin()
    expect(impersonatorInfoFromSession(admin)).toEqual({
      id: admin.id,
      username: admin.username,
      name: admin.name,
      primary_email: admin.primary_email,
      abilities: admin.abilities,
    })
  })

  it('does not include the impersonator field itself (no nesting)', () => {
    const admin = makeAdmin({ impersonator: null })
    const info = impersonatorInfoFromSession(admin)
    expect('impersonator' in info).toBe(false)
  })
})

describe('redis key helpers', () => {
  it('returns deterministic keys for a session id', () => {
    expect(sessionKey('abc123')).toBe('session:abc123')
    expect(backupKey('abc123')).toBe('impersonator:session:abc123')
  })
})

describe('impersonate start schema', () => {
  it('accepts a valid uuid', () => {
    const parsed = ImpersonateStartSchema.parse({ user_id: '7f3c1c4e-2c4e-4d4d-9d4e-2c4e4d4d9d4e' })
    expect(parsed.user_id).toBe('7f3c1c4e-2c4e-4d4d-9d4e-2c4e4d4d9d4e')
  })

  it('rejects a non-uuid user_id', () => {
    expect(() => ImpersonateStartSchema.parse({ user_id: 'not-a-uuid' })).toThrow()
  })

  it('rejects when user_id is missing', () => {
    expect(() => ImpersonateStartSchema.parse({})).toThrow()
  })
})

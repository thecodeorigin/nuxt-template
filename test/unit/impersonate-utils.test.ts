import type { AuthUser } from '~~/server/utils/auth'
import { describe, expect, it } from 'vitest'
import {
  backupKey,
  buildImpersonatedSession,
  IMPERSONATE_ABILITY,
  impersonatorInfoFromSession,
  sessionKey,
} from '~~/server/utils/impersonate'
import { ImpersonateStartSchema } from '~~/shared/schemas/impersonate'

function makeAdmin(over: Partial<AuthUser> = {}): AuthUser {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    primary_email: 'admin@seed.local',
    primary_phone: null,
    username: 'admin',
    name: 'Seed Admin',
    avatar: null,
    verified: true,
    provider: 'google',
    abilities: ['user:impersonate', 'user:read'],
    ...over,
  }
}

function makeTarget(over: Record<string, unknown> = {}) {
  return {
    id: '7f3c1c4e-2c4e-4d4d-9d4e-2c4e4d4d9d4e',
    primary_email: 'alice@seed.local',
    primary_phone: '+10000000002',
    username: 'alice',
    name: 'Alice',
    avatar: null,
    verified: true,
    abilities: ['todo:read', 'todo:write'],
    ...over,
  } as Parameters<typeof buildImpersonatedSession>[0]
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

describe('buildImpersonatedSession', () => {
  it('returns the target user as the new session, with impersonator attached', () => {
    const admin = makeAdmin()
    const target = makeTarget()
    const session = buildImpersonatedSession(target, impersonatorInfoFromSession(admin))

    expect(session.id).toBe(target.id)
    expect(session.primary_email).toBe(target.primary_email)
    expect(session.abilities).toEqual(['todo:read', 'todo:write'])
    expect(session.impersonator?.id).toBe(admin.id)
    expect(session.impersonator?.abilities).toContain('user:impersonate')
  })

  it('sets provider to "impersonation" so it is distinguishable from a real login', () => {
    const session = buildImpersonatedSession(makeTarget(), impersonatorInfoFromSession(makeAdmin()))
    expect(session.provider).toBe('impersonation')
  })

  it('coerces null target abilities to an empty array', () => {
    const session = buildImpersonatedSession(
      makeTarget({ abilities: null }),
      impersonatorInfoFromSession(makeAdmin()),
    )
    expect(session.abilities).toEqual([])
  })

  it('coerces null username/name to empty strings (AuthUser requires strings)', () => {
    const session = buildImpersonatedSession(
      makeTarget({ username: null, name: null }),
      impersonatorInfoFromSession(makeAdmin()),
    )
    expect(session.username).toBe('')
    expect(session.name).toBe('')
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

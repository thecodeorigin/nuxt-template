// @vitest-environment nuxt
import type { AuthUser } from '#layers/auth/server/services/auth'
import { describe, expect, it } from 'vitest'

const ADMIN: AuthUser = {
  id: 'admin-1',
  primary_email: 'admin@seed.local',
  primary_phone: null,
  username: 'admin',
  name: 'Admin',
  avatar: null,
  verified: true,
  provider: 'google',
  abilities: ['user:impersonate'],
  activeOrganizationId: null,
  impersonator: null,
}

const ALICE_AS_IMPERSONATED: AuthUser = {
  ...ADMIN,
  id: 'alice-1',
  primary_email: 'alice@seed.local',
  username: 'alice',
  name: 'Alice',
  abilities: ['todo:read'],
  provider: 'impersonation',
  impersonator: {
    id: ADMIN.id,
    username: ADMIN.username,
    name: ADMIN.name,
    primary_email: ADMIN.primary_email,
    abilities: ADMIN.abilities,
  },
}

describe('auth store — impersonation state', () => {
  it('exposes isImpersonating=false and impersonator=null for a normal session', () => {
    const auth = useAuthStore()
    auth.currentUser = ADMIN
    expect(auth.isImpersonating).toBe(false)
    expect(auth.impersonator).toBeNull()
  })

  it('exposes isImpersonating=true and a populated impersonator while impersonating', () => {
    const auth = useAuthStore()
    auth.currentUser = ALICE_AS_IMPERSONATED
    expect(auth.isImpersonating).toBe(true)
    expect(auth.impersonator?.id).toBe('admin-1')
    expect(auth.impersonator?.abilities).toContain('user:impersonate')
  })

  it('currentUser holds the impersonated user (NOT the admin) — so display + checks see B', () => {
    const auth = useAuthStore()
    auth.currentUser = ALICE_AS_IMPERSONATED
    expect(auth.currentUser?.id).toBe('alice-1')
    expect(auth.currentUser?.abilities).toEqual(['todo:read'])
  })

  it('returns to a clean state when currentUser is null', () => {
    const auth = useAuthStore()
    auth.currentUser = null
    expect(auth.isImpersonating).toBe(false)
    expect(auth.impersonator).toBeNull()
  })
})

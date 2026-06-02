import { describe, expect, it } from 'vitest'
import { planRolePermissionSync } from '#layers/auth/server/tasks/roles/sync'
import { DEFAULT_MEMBER_ABILITIES, DEFAULT_PERSONAL_ORG_ABILITIES, DEFAULT_ROLE_ABILITIES, DefaultRole, keysAllowedFor } from '#layers/auth/shared/permissions'

function row(over: Partial<{ id: string, name: string, permissions: string[], organization_id: string }>) {
  return {
    id: 'r1',
    name: 'Member',
    permissions: [],
    organization_id: 'o1',
    ...over,
  }
}

describe('planRolePermissionSync', () => {
  it('targets a drifted Member role with the canonical member abilities', () => {
    const [change] = planRolePermissionSync([row({ name: 'Member', permissions: ['project:read'] })])
    expect(change!.permissions).toEqual([...DEFAULT_ROLE_ABILITIES[DefaultRole.MEMBER]])
  })

  it('skips a role already in sync (order-insensitive)', () => {
    const perms = [...DEFAULT_ROLE_ABILITIES[DefaultRole.ADMIN]].reverse()
    expect(planRolePermissionSync([row({ name: 'Admin', permissions: perms })])).toEqual([])
  })

  it('ignores custom (non-default) role names', () => {
    expect(planRolePermissionSync([row({ name: 'Billing Viewer', permissions: [] })])).toEqual([])
  })
})

describe('default role abilities source of truth', () => {
  it('only contains tenant-grantable keys', () => {
    const tenant = keysAllowedFor(false)
    for (const keys of Object.values(DEFAULT_ROLE_ABILITIES)) {
      for (const k of keys) {
        expect(tenant.has(k)).toBe(true)
      }
    }
  })

  it('derives the public defaults from the map', () => {
    expect(DEFAULT_PERSONAL_ORG_ABILITIES).toBe(DEFAULT_ROLE_ABILITIES[DefaultRole.ADMIN])
    expect(DEFAULT_MEMBER_ABILITIES).toBe(DEFAULT_ROLE_ABILITIES[DefaultRole.MEMBER])
  })
})

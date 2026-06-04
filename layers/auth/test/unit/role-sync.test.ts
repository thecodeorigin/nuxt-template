import { beforeEach, describe, expect, it } from 'vitest'
import { getDefaultRoleAbilities, keysAllowedFor } from '#layers/auth/server/services/permissions-registry'
import { planRolePermissionSync } from '#layers/auth/server/tasks/roles/sync'
import { DefaultRole } from '#layers/auth/shared/permissions'
import { registerCoreDomainsForTest } from '#layers/auth/test/unit/_helpers/registry'

beforeEach(() => registerCoreDomainsForTest())

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
  it('targets a drifted Member role with the registry member abilities', () => {
    const [change] = planRolePermissionSync([row({ name: 'Member', permissions: ['project:read'] })], getDefaultRoleAbilities)
    expect(new Set(change!.permissions)).toEqual(new Set(getDefaultRoleAbilities(DefaultRole.MEMBER)))
  })

  it('skips a role already in sync (order-insensitive)', () => {
    const perms = [...getDefaultRoleAbilities(DefaultRole.ADMIN)].reverse()
    expect(planRolePermissionSync([row({ name: 'Admin', permissions: perms })], getDefaultRoleAbilities)).toEqual([])
  })

  it('ignores custom (non-default) role names', () => {
    expect(planRolePermissionSync([row({ name: 'Billing Viewer', permissions: [] })], getDefaultRoleAbilities)).toEqual([])
  })
})

describe('default role abilities source of truth', () => {
  it('only contains tenant-grantable keys', () => {
    const tenant = keysAllowedFor(false)
    for (const role of [DefaultRole.ADMIN, DefaultRole.MEMBER, DefaultRole.GUEST]) {
      for (const k of getDefaultRoleAbilities(role)) {
        expect(tenant.has(k)).toBe(true)
      }
    }
  })
})

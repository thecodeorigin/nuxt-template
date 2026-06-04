import { beforeEach, describe, expect, it } from 'vitest'
import { SYSTEM_GRANTS } from '#layers/auth/server/constants/defaults'
import {
  getDefaultRoleAbilities,
  getRegisteredCatalog,
  getTenantAbilityKeys,
  keysAllowedFor,
  mergeOrgAbilities,
} from '#layers/auth/server/services/permissions-registry'
import { DefaultRole, SYSTEM_ABILITY_KEYS } from '#layers/auth/shared/permissions'
import { registerCoreDomainsForTest } from '#layers/auth/test/unit/_helpers/registry'

beforeEach(() => registerCoreDomainsForTest())

describe('ability key placement', () => {
  it('system and tenant keys are disjoint', () => {
    const tenantKeys = getTenantAbilityKeys()
    for (const k of SYSTEM_ABILITY_KEYS)
      expect(tenantKeys.has(k)).toBe(false)
  })

  it('a tenant org cannot legally hold a system key', () => {
    expect(keysAllowedFor(false).has('user:impersonate')).toBe(false)
    expect(keysAllowedFor(false).has('user:manage')).toBe(true)
  })

  it('a system org may hold only system keys', () => {
    expect(keysAllowedFor(true).has('user:impersonate')).toBe(true)
    expect(keysAllowedFor(true).has('user:manage')).toBe(false)
  })

  it('mergeOrgAbilities drops misplaced keys (defense in depth)', () => {
    expect(mergeOrgAbilities([], ['user:impersonate', 'user:manage'], false)).toEqual(['user:manage'])
    expect(mergeOrgAbilities(['user:manage', 'user:impersonate'], [], false)).toEqual(['user:impersonate'])
  })

  it('mergeOrgAbilities unions system + active grants without duplicates', () => {
    const merged = mergeOrgAbilities(['user:impersonate'], ['user:manage', 'project:manage'], false)
    expect(merged).toContain('user:impersonate')
    expect(merged).toContain('user:manage')
    expect(merged).toContain('project:manage')
    expect(new Set(merged).size).toBe(merged.length)
  })
})

describe('permission catalog', () => {
  it('classifies user:impersonate as system and tenant keys as tenant', () => {
    const catalog = getRegisteredCatalog()
    const byKey = Object.fromEntries(catalog.map(p => [p.key, p]))
    expect(byKey['user:impersonate']!.org_kind).toBe('system')
    expect(byKey['user:manage']!.org_kind).toBe('tenant')
    expect(byKey['product:manage']!.org_kind).toBe('system')
  })
})

describe('seed grant sets', () => {
  it('every system grant key is a system key', () => {
    for (const a of SYSTEM_GRANTS.admin)
      expect(SYSTEM_ABILITY_KEYS.has(a)).toBe(true)
  })

  it('every default-role abilities key is a catalogued, non-system key', () => {
    const allKeys = new Set(getRegisteredCatalog().map(p => p.key))
    const allRoleKeys = [
      ...getDefaultRoleAbilities(DefaultRole.ADMIN),
      ...getDefaultRoleAbilities(DefaultRole.MEMBER),
      ...getDefaultRoleAbilities(DefaultRole.GUEST),
    ]
    for (const a of allRoleKeys)
      expect(allKeys.has(a) && !SYSTEM_ABILITY_KEYS.has(a)).toBe(true)
  })
})

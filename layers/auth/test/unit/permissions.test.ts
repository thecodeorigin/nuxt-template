import { describe, expect, it } from 'vitest'
import { DEMO_ORG_GRANTS, SYSTEM_GRANTS } from '#layers/auth/server/services/seed'
import {
  ALL_ABILITY_KEYS,
  buildPermissionCatalog,
  keysAllowedFor,
  mergeOrgAbilities,
  SYSTEM_ABILITY_KEYS,
  TENANT_ABILITY_KEYS,
} from '#layers/auth/shared/permissions'

describe('ability key placement', () => {
  it('system and tenant keys are disjoint', () => {
    for (const k of SYSTEM_ABILITY_KEYS)
      expect(TENANT_ABILITY_KEYS.has(k)).toBe(false)
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
    // impersonate stuffed into a tenant grant is ignored
    expect(mergeOrgAbilities([], ['user:impersonate', 'user:manage'], false)).toEqual(['user:manage'])
    // a tenant key in the system grant is ignored
    expect(mergeOrgAbilities(['user:manage', 'user:impersonate'], [], false)).toEqual(['user:impersonate'])
  })

  it('mergeOrgAbilities unions system + active grants without duplicates', () => {
    const merged = mergeOrgAbilities(['user:impersonate'], ['user:manage', 'todo:manage'], false)
    expect(merged).toContain('user:impersonate')
    expect(merged).toContain('user:manage')
    expect(merged).toContain('todo:manage')
    expect(new Set(merged).size).toBe(merged.length)
  })
})

describe('permission catalog', () => {
  it('classifies user:impersonate as system and tenant keys as tenant', () => {
    const catalog = buildPermissionCatalog()
    const byKey = Object.fromEntries(catalog.map(p => [p.key, p]))
    expect(byKey['user:impersonate']!.org_kind).toBe('system')
    expect(byKey['user:manage']!.org_kind).toBe('tenant')
    expect(byKey['todo:delete:self']!.scope).toBe('self')
  })
})

describe('seed grant sets', () => {
  it('every system grant key is a system key', () => {
    for (const a of SYSTEM_GRANTS.admin)
      expect(SYSTEM_ABILITY_KEYS.has(a)).toBe(true)
  })

  it('every demo-org grant key is a catalogued, non-system key', () => {
    for (const a of [...DEMO_ORG_GRANTS.admin, ...DEMO_ORG_GRANTS.member, ...DEMO_ORG_GRANTS.guest])
      expect(ALL_ABILITY_KEYS.has(a) && !SYSTEM_ABILITY_KEYS.has(a)).toBe(true)
  })
})

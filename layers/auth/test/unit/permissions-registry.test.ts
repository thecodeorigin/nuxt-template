import { beforeEach, describe, expect, it } from 'vitest'
import {
  _resetPermissionDomains,
  getCatalogSelfKeys,
  getDefaultRoleAbilities,
  getRegisteredCatalog,
  getTenantAbilityKeys,
  keysAllowedFor,
  mergeOrgAbilities,
} from '#layers/auth/server/services/permissions-registry'
import { DefaultRole, SYSTEM_ABILITY_KEYS } from '#layers/auth/shared/permissions'
import { registerCoreDomainsForTest } from '#layers/auth/test/unit/_helpers/registry'

// Snapshots of the OLD static permissions.ts values — parity contract.
const OLD_TENANT_SUBJECTS = ['user', 'project', 'billing', 'selfhost']
const OLD_TENANT_ACTIONS = ['read', 'write', 'delete', 'manage']
const OLD_TENANT_ABILITY_KEYS = new Set(OLD_TENANT_SUBJECTS.flatMap(s => OLD_TENANT_ACTIONS.map(a => `${s}:${a}`)))
const OLD_CATALOG_SELF_KEYS = new Set(OLD_TENANT_SUBJECTS.flatMap(s => OLD_TENANT_ACTIONS.map(a => `${s}:${a}:self`)))
const OLD_DEFAULT_ROLE_ABILITIES = {
  [DefaultRole.ADMIN]: ['user:manage', 'project:manage', 'selfhost:manage', 'billing:manage'],
  [DefaultRole.MEMBER]: [
    'user:read',
    'user:read:self',
    'user:write:self',
    'user:delete:self',
    'user:manage:self',
    'project:read',
    'project:write',
    'project:read:self',
    'project:write:self',
    'project:delete:self',
    'project:manage:self',
    'selfhost:read',
    'selfhost:write',
    'billing:read',
    'billing:read:self',
  ],
  [DefaultRole.GUEST]: ['project:read', 'project:read:self', 'user:read:self'],
}

beforeEach(() => registerCoreDomainsForTest())

describe('registry parity — tenant ability keys', () => {
  it('getTenantAbilityKeys() equals the old TENANT_ABILITY_KEYS (order-insensitive)', () => {
    const got = getTenantAbilityKeys()
    expect(got.size).toBe(OLD_TENANT_ABILITY_KEYS.size)
    for (const k of OLD_TENANT_ABILITY_KEYS) expect(got.has(k)).toBe(true)
  })

  it('getCatalogSelfKeys() equals the old CATALOG_SELF_KEYS (order-insensitive)', () => {
    const got = getCatalogSelfKeys()
    expect(got.size).toBe(OLD_CATALOG_SELF_KEYS.size)
    for (const k of OLD_CATALOG_SELF_KEYS) expect(got.has(k)).toBe(true)
  })
})

describe('registry parity — default role abilities', () => {
  it('aDMIN matches old DEFAULT_ROLE_ABILITIES[ADMIN] (order-insensitive)', () => {
    const got = new Set(getDefaultRoleAbilities(DefaultRole.ADMIN))
    const want = new Set(OLD_DEFAULT_ROLE_ABILITIES[DefaultRole.ADMIN])
    expect(got).toEqual(want)
  })

  it('mEMBER matches old DEFAULT_ROLE_ABILITIES[MEMBER] (order-insensitive)', () => {
    const got = new Set(getDefaultRoleAbilities(DefaultRole.MEMBER))
    const want = new Set(OLD_DEFAULT_ROLE_ABILITIES[DefaultRole.MEMBER])
    expect(got).toEqual(want)
  })

  it('gUEST matches old DEFAULT_ROLE_ABILITIES[GUEST] (order-insensitive)', () => {
    const got = new Set(getDefaultRoleAbilities(DefaultRole.GUEST))
    const want = new Set(OLD_DEFAULT_ROLE_ABILITIES[DefaultRole.GUEST])
    expect(got).toEqual(want)
  })
})

describe('registry parity — catalog', () => {
  it('getRegisteredCatalog() key set equals old buildPermissionCatalog() key set', () => {
    const oldKeys = new Set([...OLD_TENANT_ABILITY_KEYS, ...SYSTEM_ABILITY_KEYS, ...OLD_CATALOG_SELF_KEYS])
    const got = new Set(getRegisteredCatalog().map(p => p.key))
    expect(got).toEqual(oldKeys)
  })

  it('classifies user:impersonate as system and user:manage as tenant', () => {
    const byKey = Object.fromEntries(getRegisteredCatalog().map(p => [p.key, p]))
    expect(byKey['user:impersonate']!.org_kind).toBe('system')
    expect(byKey['user:manage']!.org_kind).toBe('tenant')
    expect(byKey['product:manage']!.org_kind).toBe('system')
  })
})

describe('keysAllowedFor', () => {
  it('a tenant org cannot hold a system key', () => {
    expect(keysAllowedFor(false).has('user:impersonate')).toBe(false)
    expect(keysAllowedFor(false).has('user:manage')).toBe(true)
  })

  it('a system org may only hold system keys', () => {
    expect(keysAllowedFor(true).has('user:impersonate')).toBe(true)
    expect(keysAllowedFor(true).has('user:manage')).toBe(false)
  })
})

describe('mergeOrgAbilities', () => {
  it('drops misplaced keys (defense in depth)', () => {
    expect(mergeOrgAbilities([], ['user:impersonate', 'user:manage'], false)).toEqual(['user:manage'])
    expect(mergeOrgAbilities(['user:manage', 'user:impersonate'], [], false)).toEqual(['user:impersonate'])
  })

  it('unions system + active grants without duplicates', () => {
    const merged = mergeOrgAbilities(['user:impersonate'], ['user:manage', 'project:manage'], false)
    expect(merged).toContain('user:impersonate')
    expect(merged).toContain('user:manage')
    expect(merged).toContain('project:manage')
    expect(new Set(merged).size).toBe(merged.length)
  })
})

describe('assertRegistered guard', () => {
  it('throws when registry is empty', () => {
    _resetPermissionDomains()
    expect(() => getTenantAbilityKeys()).toThrow('Permission registry empty')
  })
})

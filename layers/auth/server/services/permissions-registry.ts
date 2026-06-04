import type { MongoAbility } from '@casl/ability'
import type { DefaultRole, PermissionDef } from '#layers/auth/shared/permissions'
import { createError } from 'h3'
import { parseAbility } from '#layers/auth/shared/ability'
import { SYSTEM_ABILITY_KEYS } from '#layers/auth/shared/permissions'

const TENANT_ACTIONS = ['read', 'write', 'delete', 'manage'] as const

export interface PermissionDomain {
  subject: string
  orgKind: 'system' | 'tenant'
  actions?: readonly string[]
  /** emit `${subject}:${action}:self` catalog variants (default true) */
  self?: boolean
  defaultRoleAbilities?: Partial<Record<DefaultRole, readonly string[]>>
}

const registry = new Map<string, PermissionDomain>()

export function definePermissionDomain(d: PermissionDomain) {
  registry.set(d.subject, d)
}

export function _resetPermissionDomains() {
  registry.clear()
}

export function getPermissionDomains() {
  return [...registry.values()]
}

function assertRegistered() {
  if (registry.size === 0) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Permission registry empty — no definePermissionDomain plugin ran.',
    })
  }
}

function tenantDomains() {
  return [...registry.values()].filter(d => d.orgKind === 'tenant')
}

export function getTenantAbilityKeys(): Set<string> {
  assertRegistered()
  const keys = new Set<string>()
  for (const d of tenantDomains()) {
    for (const a of d.actions ?? TENANT_ACTIONS) keys.add(`${d.subject}:${a}`)
  }
  return keys
}

export function getCatalogSelfKeys(): Set<string> {
  assertRegistered()
  const keys = new Set<string>()
  for (const d of tenantDomains()) {
    if (d.self === false)
      continue
    for (const a of d.actions ?? TENANT_ACTIONS) keys.add(`${d.subject}:${a}:self`)
  }
  return keys
}

/** Tenant keys an org of a given kind may legally hold. */
export function keysAllowedFor(isSystem: boolean): ReadonlySet<string> {
  return isSystem ? SYSTEM_ABILITY_KEYS : new Set([...getTenantAbilityKeys(), ...getCatalogSelfKeys()])
}

export function getDefaultRoleAbilities(role: DefaultRole): string[] {
  assertRegistered()
  const out = new Set<string>()
  for (const d of registry.values()) {
    for (const k of d.defaultRoleAbilities?.[role] ?? []) out.add(k)
  }
  return [...out]
}

const ACTION_VERB: Record<string, string> = {
  read: 'View',
  write: 'Create and edit',
  delete: 'Delete',
  manage: 'Full control over',
  impersonate: 'Impersonate',
}

function def(key: string): PermissionDef {
  const { subject, action, scope } = parseAbility(key)
  const base = `${ACTION_VERB[action] ?? action} ${subject}`
  return {
    key,
    subject,
    action,
    scope: scope ?? null,
    org_kind: SYSTEM_ABILITY_KEYS.has(key) ? 'system' : 'tenant',
    description: scope === 'self' ? `${base} (own only)` : base,
  }
}

/** Self-ability keys for the 'user' domain — the floor every member always holds. */
export function getUserSelfAbilityKeys(): Set<string> {
  const userDomain = registry.get('user')
  const actions = userDomain?.actions ?? TENANT_ACTIONS
  return new Set(actions.map(a => `user:${a}:self`))
}

export function getRegisteredCatalog(): PermissionDef[] {
  return [...getTenantAbilityKeys(), ...SYSTEM_ABILITY_KEYS, ...getCatalogSelfKeys()].map(def)
}

/** mergeOrgAbilities, registry-aware. */
export function mergeOrgAbilities(systemGrants: string[], activeGrants: string[], activeIsSystem: boolean): string[] {
  const sys = systemGrants.filter(a => SYSTEM_ABILITY_KEYS.has(a))
  const active = activeGrants.filter(a => keysAllowedFor(activeIsSystem).has(a))
  return [...new Set([...sys, ...active])]
}

export function canGrantAbility(actorAbility: MongoAbility, key: string): boolean {
  const [s = '', a = '', scope] = key.split(':')
  const rules = actorAbility.rulesFor(a, s)
  return scope === 'self' ? rules.length > 0 : rules.some(r => !r.conditions)
}

export function assertGrantable(actorAbility: MongoAbility, requested: string[]): string[] {
  const tenantKeys = keysAllowedFor(false)
  return [...new Set(requested.filter(key => !tenantKeys.has(key) || !canGrantAbility(actorAbility, key)))]
}

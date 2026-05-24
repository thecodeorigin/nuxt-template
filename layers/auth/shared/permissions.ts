import { parseAbility, satisfiesAbility } from '#layers/auth/shared/ability'

export const TENANT_SUBJECTS = ['user', 'todo', 'billing'] as const
export const TENANT_ACTIONS = ['read', 'write', 'delete', 'manage'] as const

// Platform powers — grantable ONLY in the system org.
export const SYSTEM_ABILITY_KEYS = new Set<string>([
  'user:impersonate',
  'system:manage',
])

// Resource powers — grantable in tenant orgs (subjects × actions).
export const TENANT_ABILITY_KEYS = new Set<string>(
  TENANT_SUBJECTS.flatMap(s => TENANT_ACTIONS.map(a => `${s}:${a}`)),
)

// Self-scoped defaults (own resources within an org). Seeded for visibility,
// not toggled in the editor.
export const SELF_ABILITY_KEYS = new Set<string>(['todo:delete:self'])

// --- defaults ----------------------------------------------------------
// Owner of a personal org (admin of their own workspace).
export const DEFAULT_PERSONAL_ORG_ABILITIES = ['user:manage', 'todo:manage', 'billing:manage', 'billing:read'] as const

// Granted to a user joining an org as a plain member (direct add or accepted
// invitation): manage their own todos, no org administration.
export const DEFAULT_MEMBER_ABILITIES = ['todo:read', 'todo:write', 'todo:delete:self', 'billing:read'] as const

export interface PermissionDef {
  key: string
  subject: string
  action: string
  scope: string | null
  org_kind: 'system' | 'tenant'
  description: string
}

const ACTION_VERB: Record<string, string> = {
  read: 'View',
  write: 'Create and edit',
  delete: 'Delete',
  manage: 'Full control over',
  impersonate: 'Impersonate',
}

function orgKindOf(key: string): 'system' | 'tenant' {
  return SYSTEM_ABILITY_KEYS.has(key) ? 'system' : 'tenant'
}

function def(key: string): PermissionDef {
  const { subject, action, scope } = parseAbility(key)
  const base = `${ACTION_VERB[action] ?? action} ${subject}`
  return {
    key,
    subject,
    action,
    scope: scope ?? null,
    org_kind: orgKindOf(key),
    description: scope === 'self' ? `${base} (own only)` : base,
  }
}

export function buildPermissionCatalog(): PermissionDef[] {
  return [...TENANT_ABILITY_KEYS, ...SYSTEM_ABILITY_KEYS, ...SELF_ABILITY_KEYS].map(def)
}

export const ALL_ABILITY_KEYS: ReadonlySet<string> = new Set(buildPermissionCatalog().map(p => p.key))

/** Which keys an org of a given kind may legally hold. */
export function keysAllowedFor(isSystem: boolean): ReadonlySet<string> {
  return isSystem ? SYSTEM_ABILITY_KEYS : new Set([...TENANT_ABILITY_KEYS, ...SELF_ABILITY_KEYS])
}

/** Pure union+filter used by loadEffectiveAbilities — testable. */
export function mergeOrgAbilities(systemGrants: string[], activeGrants: string[], activeIsSystem: boolean): string[] {
  const sys = systemGrants.filter(a => SYSTEM_ABILITY_KEYS.has(a))
  const active = activeGrants.filter(a => keysAllowedFor(activeIsSystem).has(a))
  return [...new Set([...sys, ...active])]
}

/** Editor (tenant) may only submit tenant keys (no :self, no system). */
export const EDITABLE_TENANT_KEYS = TENANT_ABILITY_KEYS

/**
 * Returns the ability keys from `requested` that the actor cannot grant.
 * A key is un-grantable if it is not a tenant key or the actor does not hold it.
 */
export function assertGrantable(actorEffective: string[], requested: string[]): string[] {
  const tenantKeys = keysAllowedFor(false)
  const illegalKind = requested.filter(k => !tenantKeys.has(k))
  const notHeld = requested.filter(k => tenantKeys.has(k) && !satisfiesAbility(actorEffective, k))
  return [...new Set([...illegalKind, ...notHeld])]
}

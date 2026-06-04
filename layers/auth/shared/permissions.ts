import type { MongoAbility } from '@casl/ability'
import { parseAbility } from '#layers/auth/shared/ability'

export const TENANT_SUBJECTS: readonly string[] = ['user', 'project', 'billing', 'selfhost']
export const TENANT_ACTIONS = ['read', 'write', 'delete', 'manage'] as const

// Platform powers — grantable ONLY in the system org.
export const SYSTEM_ABILITY_KEYS = new Set<string>([
  'user:impersonate',
  'system:manage',
  'support:manage',
  'product:write',
  'product:delete',
  'product:manage',
])

// Resource powers — grantable in tenant orgs (subjects × actions).
export const TENANT_ABILITY_KEYS = new Set<string>(
  TENANT_SUBJECTS.flatMap(s => TENANT_ACTIONS.map(a => `${s}:${a}`)),
)

// All possible :self keys (for the catalog and validation)
export const CATALOG_SELF_KEYS = new Set<string>(
  TENANT_SUBJECTS.flatMap(s => TENANT_ACTIONS.map(a => `${s}:${a}:self`)),
)

// Universal minimum :self keys auto-merged for every member
export const SELF_ABILITY_KEYS = new Set<string>(
  TENANT_ACTIONS.map(a => `user:${a}:self`),
)

// --- default role model (source of truth) ------------------------------
// Edit DEFAULT_ROLE_ABILITIES when a feature rolls out, then run `roles:sync`
// (see server/tasks/roles/sync.ts) to replace every org's system-role
// permissions. `manage` supersets read/write/delete at the same scope
// (ability.ts:satisfiesAbility), so a `*:manage` key already implies its reads.
export enum DefaultRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest',
}

export const DEFAULT_ROLE_ABILITIES = {
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
  [DefaultRole.GUEST]: [
    'project:read',
    'project:read:self',
    'user:read:self',
  ],
} as const satisfies Record<DefaultRole, readonly string[]>

// Display name of each materialized system role. Guest has no row today (preset
// only) but stays here for invitation/demo presets + future materialization.
export const DEFAULT_ROLE_NAME: Record<DefaultRole, string> = {
  [DefaultRole.ADMIN]: 'Admin',
  [DefaultRole.MEMBER]: 'Member',
  [DefaultRole.GUEST]: 'Guest',
}

// Owner of a personal org (admin of their own workspace).
export const DEFAULT_PERSONAL_ORG_ABILITIES: readonly string[] = DEFAULT_ROLE_ABILITIES[DefaultRole.ADMIN]
// Granted to a user joining an org as a plain member (direct add / accepted invite).
export const DEFAULT_MEMBER_ABILITIES: readonly string[] = DEFAULT_ROLE_ABILITIES[DefaultRole.MEMBER]

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
  return [...TENANT_ABILITY_KEYS, ...SYSTEM_ABILITY_KEYS, ...CATALOG_SELF_KEYS].map(def)
}

export const ALL_ABILITY_KEYS: ReadonlySet<string> = new Set(buildPermissionCatalog().map(p => p.key))

/** Which keys an org of a given kind may legally hold. */
export function keysAllowedFor(isSystem: boolean): ReadonlySet<string> {
  return isSystem ? SYSTEM_ABILITY_KEYS : new Set([...TENANT_ABILITY_KEYS, ...CATALOG_SELF_KEYS])
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
 * Returns true if the actor can grant the given ability key to another user.
 * For non-self keys: actor needs an unconditional (unscoped) matching rule.
 * For :self keys: actor needs any matching rule (scoped or unscoped).
 */
export function canGrantAbility(actorAbility: MongoAbility, key: string): boolean {
  const [s = '', a = '', scope] = key.split(':')
  const rules = actorAbility.rulesFor(a, s)
  return scope === 'self' ? rules.length > 0 : rules.some(r => !r.conditions)
}

/**
 * Returns the subset of requested keys the actor cannot grant.
 * Illegal-kind keys (not in the tenant catalog) are always returned.
 */
export function assertGrantable(actorAbility: MongoAbility, requested: string[]): string[] {
  const tenantKeys = keysAllowedFor(false)
  return [...new Set(requested.filter(key => !tenantKeys.has(key) || !canGrantAbility(actorAbility, key)))]
}

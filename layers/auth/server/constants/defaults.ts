/**
 * Default values for the auth layer — orgs the platform always has, the
 * three dev/demo users, and the ability grants attached to each.
 *
 * **Constants only.** No Drizzle calls, no side effects. The seed tasks
 * (`layers/auth/server/tasks/seed/*.ts`) and the production-grade
 * `create:*` tasks consume these.
 *
 * When a new feature ships a new ability key, the relevant grant set in
 * this file is the **first** place it goes. See
 * `.agents/skills/data/references/permission-aware-data.md`.
 */

// --- Reserved orgs ------------------------------------------------------

/** Reserved platform org. Members here hold platform-wide abilities (`user:impersonate`, `system:manage`). */
export const SYSTEM_ORG = { slug: 'system', name: 'System' } as const

/** Shared tenant org so demo accounts share a workspace. Dev/demo only. */
export const DEMO_ORG = { slug: 'demo', name: 'Demo Organization' } as const

// --- Ability grant sets -------------------------------------------------

/** System-org memberships. Grantable ONLY in the system org. */
export const SYSTEM_GRANTS = {
  admin: ['user:impersonate', 'system:manage', 'support:manage', 'product:manage'],
} as const

/** Demo (tenant) org memberships — the three tiers seeded for the demo org. */
export const DEMO_ORG_GRANTS = {
  admin: ['user:manage', 'project:manage', 'billing:manage', 'billing:read'],
  member: ['user:read', 'project:read', 'project:write', 'billing:read'],
  guest: ['project:read'],
} as const

// --- Dev/demo seed users ------------------------------------------------

export interface SeedUserDef {
  primary_email: string
  username: string
  name: string
  primary_phone?: string | null
}

/** Three fixed users seeded by `seed:users`. `@seed.local` suffix makes cleanup unambiguous. */
export const SEED_USERS: readonly SeedUserDef[] = [
  { primary_email: 'admin@seed.local', username: 'seed_admin', name: 'Seed Admin', primary_phone: '+10000000001' },
  { primary_email: 'alice@seed.local', username: 'seed_alice', name: 'Seed Alice', primary_phone: '+10000000002' },
  { primary_email: 'bob@seed.local', username: 'seed_bob', name: 'Seed Bob', primary_phone: '+10000000003' },
]

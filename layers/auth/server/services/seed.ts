import { userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { createPersonalOrganization } from '#layers/auth/server/services/organization'

export interface SeedUserDef {
  primary_email: string
  username: string
  name: string
  primary_phone?: string | null
}

// --- Org definitions (slug + display name) -------------------------------

export const SYSTEM_ORG = { slug: 'system', name: 'System' } as const
export const DEMO_ORG = { slug: 'demo', name: 'Demo Organization' } as const

// --- Org grant sets (membership-scoped, the uniform model) ---------------

// System org membership (platform powers, grantable only in the system org).
export const SYSTEM_GRANTS = {
  admin: ['user:impersonate', 'system:manage', 'support:manage'],
} as const

// Demo (tenant) org memberships.
export const DEMO_ORG_GRANTS = {
  admin: ['user:manage', 'project:manage', 'billing:manage', 'billing:read'],
  member: ['user:read', 'project:read', 'project:write', 'billing:read'],
  guest: ['project:read'],
} as const

export const SEED_USERS: SeedUserDef[] = [
  { primary_email: 'admin@seed.local', username: 'seed_admin', name: 'Seed Admin', primary_phone: '+10000000001' },
  { primary_email: 'alice@seed.local', username: 'seed_alice', name: 'Seed Alice', primary_phone: '+10000000002' },
  { primary_email: 'bob@seed.local', username: 'seed_bob', name: 'Seed Bob', primary_phone: '+10000000003' },
]

export interface SeededUser {
  id: string
  primary_email: string
}

export async function seedUsers(
  users: SeedUserDef[] = SEED_USERS,
): Promise<SeededUser[]> {
  const seeded: SeededUser[] = []
  for (const u of users) {
    const existing = await db.query.userTable.findFirst({ where: eq(userTable.primary_email, u.primary_email) })
    if (existing) {
      const [updated] = await db.update(userTable)
        .set({
          username: u.username,
          name: u.name,
          primary_phone: u.primary_phone ?? null,
          verified: true,
        })
        .where(eq(userTable.id, existing.id))
        .returning()
      await createPersonalOrganization(updated!)
      seeded.push({ id: updated!.id, primary_email: updated!.primary_email })
    }
    else {
      const [created] = await db.insert(userTable).values({
        primary_email: u.primary_email,
        username: u.username,
        name: u.name,
        primary_phone: u.primary_phone ?? null,
        verified: true,
      }).returning()
      await createPersonalOrganization(created!)
      seeded.push({ id: created!.id, primary_email: created!.primary_email })
    }
  }
  return seeded
}

export async function unseedUsers(
  users: SeedUserDef[] = SEED_USERS,
): Promise<void> {
  for (const u of users) {
    await db.delete(userTable).where(eq(userTable.primary_email, u.primary_email))
  }
}

export async function provisionPersonalUser(
  email: string,
  name?: string,
): Promise<{ user: typeof userTable.$inferSelect, personalOrgId: string }> {
  const username = email.split('@')[0]!.toLowerCase().replace(/[^a-z0-9_]/g, '_')
  const [user] = await db.insert(userTable).values({
    primary_email: email,
    username,
    name: name ?? username,
    verified: true,
  }).returning()
  const org = await createPersonalOrganization(user!)
  return { user: user!, personalOrgId: org.id }
}

import { userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'

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
  admin: ['user:impersonate'],
} as const

// Demo (tenant) org memberships.
export const DEMO_ORG_GRANTS = {
  admin: ['user:manage', 'todo:manage'],
  member: ['user:read', 'todo:read', 'todo:write', 'todo:delete:self'],
  guest: ['todo:read'],
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
    const existing = await db.select().from(userTable).where(eq(userTable.primary_email, u.primary_email)).limit(1)
    if (existing[0]) {
      const [updated] = await db.update(userTable)
        .set({
          username: u.username,
          name: u.name,
          primary_phone: u.primary_phone ?? null,
          verified: true,
        })
        .where(eq(userTable.id, existing[0].id))
        .returning()
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

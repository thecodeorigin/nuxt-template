import type { drizzle } from 'drizzle-orm/node-postgres'
import type { getPgClient } from '~~/server/utils/pg'
import { eq } from 'drizzle-orm'
import { userTable } from '~~/server/db/pg/schema'

export interface SeedUserDef {
  primary_email: string
  username: string
  name: string
  primary_phone?: string | null
  abilities: string[]
}

export const ABILITY_PRESETS = {
  admin: [
    'user:read',
    'user:write',
    'user:impersonate',
    'todo:read',
    'todo:write',
    'todo:delete',
    'blog:read',
    'blog:write',
  ],
  member: [
    'user:read',
    'todo:read',
    'todo:write',
    'todo:delete:self',
    'blog:read',
  ],
  guest: [
    'blog:read',
  ],
} as const

export const SEED_USERS: SeedUserDef[] = [
  {
    primary_email: 'admin@seed.local',
    username: 'seed_admin',
    name: 'Seed Admin',
    primary_phone: '+10000000001',
    abilities: [...ABILITY_PRESETS.admin],
  },
  {
    primary_email: 'alice@seed.local',
    username: 'seed_alice',
    name: 'Seed Alice',
    primary_phone: '+10000000002',
    abilities: [...ABILITY_PRESETS.member],
  },
  {
    primary_email: 'bob@seed.local',
    username: 'seed_bob',
    name: 'Seed Bob',
    primary_phone: '+10000000003',
    abilities: [...ABILITY_PRESETS.guest],
  },
]

type Db = ReturnType<typeof drizzle> | ReturnType<typeof getPgClient>

export interface SeededUser {
  id: string
  primary_email: string
  abilities: string[]
}

export async function seedUsers(
  db: Db,
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
          abilities: u.abilities,
          verified: true,
        })
        .where(eq(userTable.id, existing[0].id))
        .returning()
      seeded.push({ id: updated!.id, primary_email: updated!.primary_email, abilities: updated!.abilities })
    }
    else {
      const [created] = await db.insert(userTable).values({
        primary_email: u.primary_email,
        username: u.username,
        name: u.name,
        primary_phone: u.primary_phone ?? null,
        abilities: u.abilities,
        verified: true,
      }).returning()
      seeded.push({ id: created!.id, primary_email: created!.primary_email, abilities: created!.abilities })
    }
  }
  return seeded
}

export async function unseedUsers(
  db: Db,
  users: SeedUserDef[] = SEED_USERS,
): Promise<void> {
  for (const u of users) {
    await db.delete(userTable).where(eq(userTable.primary_email, u.primary_email))
  }
}

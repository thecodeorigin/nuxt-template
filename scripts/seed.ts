import type { SeedUserDef } from '../shared/seed/users'
import { config } from 'dotenv'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { userTable } from '../server/db/pg/schema'
import { SEED_USERS } from '../shared/seed/users'

config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
})

export { ABILITY_PRESETS, SEED_USERS } from '../shared/seed/users'

export async function seedUsers(
  db: ReturnType<typeof drizzle>,
  users: SeedUserDef[] = SEED_USERS,
) {
  const seeded: Array<{ id: string, primary_email: string, abilities: string[] }> = []
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
  db: ReturnType<typeof drizzle>,
  users: SeedUserDef[] = SEED_USERS,
) {
  for (const u of users) {
    await db.delete(userTable).where(eq(userTable.primary_email, u.primary_email))
  }
}

async function main() {
  const url = process.env.NUXT_POSTGRES_URL
  if (!url) {
    console.error('NUXT_POSTGRES_URL is not set; aborting seed.')
    process.exit(1)
  }
  const db = drizzle(url)

  const cmd = process.argv[2] ?? 'up'
  if (cmd === 'down') {
    await unseedUsers(db)
    console.log(`Removed ${SEED_USERS.length} seed users.`)
  }
  else {
    const seeded = await seedUsers(db)
    for (const s of seeded) {
      console.log(`Seeded ${s.primary_email} (id=${s.id}, abilities=[${s.abilities.join(', ')}])`)
    }
  }

  process.exit(0)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}

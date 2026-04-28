import { eq } from 'drizzle-orm'
import { userTable } from '~~/server/db/pg/schema'
import { getPgClient } from '~~/server/utils/pg'
import { SEED_USERS } from '~~/shared/seed/users'

export default defineEventHandler(async (_event) => {
  if (!import.meta.dev && process.env.NUXT_DEMO_MODE !== 'true') {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const db = getPgClient()
  const out: Array<{ id: string, primary_email: string }> = []

  for (const u of SEED_USERS) {
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
      out.push(updated!)
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
      out.push(created!)
    }
  }

  return { users: out }
})

import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { ActivityAction, activityTable, userTable } from '~~/server/db/pg/schema'
import { getPgClient } from '~~/server/utils/pg'
import { ABILITY_PRESETS } from '~~/server/services/seed'
import { simplifyNanoId } from '~~/shared/utils/id'

interface DemoAgent {
  email: string
  username: string
  name: string
  abilities: string[]
}

const DEMO_AGENTS: Record<'admin' | 'user', DemoAgent> = {
  admin: {
    email: 'admin@demo.local',
    username: 'demo_admin',
    name: 'Admin Agent',
    abilities: [...ABILITY_PRESETS.admin],
  },
  user: {
    email: 'user@demo.local',
    username: 'demo_user',
    name: 'User Agent',
    abilities: [...ABILITY_PRESETS.member],
  },
}

const DemoLoginSchema = z.object({
  agent: z.enum(['admin', 'user']),
})

export default defineEventHandler(async (event) => {
  if (!import.meta.dev && process.env.NUXT_DEMO_MODE !== 'true') {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const { agent } = await readValidatedBody(event, DemoLoginSchema.parse)
  const preset = DEMO_AGENTS[agent]

  const db = getPgClient()
  const now = new Date()

  const existing = await db.select().from(userTable).where(eq(userTable.primary_email, preset.email)).limit(1)

  let user = existing[0]
  if (!user) {
    const [created] = await db.insert(userTable).values({
      primary_email: preset.email,
      username: preset.username,
      name: preset.name,
      abilities: preset.abilities,
      verified: true,
      last_sign_in_at: now,
    }).returning()
    user = created!
    await db.insert(activityTable).values({ user_id: user.id, action: ActivityAction.SIGN_UP })
  }
  else {
    const [updated] = await db.update(userTable)
      .set({
        username: preset.username,
        name: preset.name,
        abilities: preset.abilities,
        verified: true,
        last_sign_in_at: now,
      })
      .where(eq(userTable.id, user.id))
      .returning()
    user = updated!
  }

  const sessionId = simplifyNanoId()
  const storage = useStorage('redis')

  await storage.setItem(`session:${sessionId}`, {
    id: user.id,
    primary_email: user.primary_email,
    primary_phone: user.primary_phone,
    username: user.username,
    name: user.name,
    avatar: user.avatar,
    verified: user.verified,
    provider: 'demo',
    abilities: user.abilities ?? [],
  })

  setCookie(event, 'sessionid', sessionId, {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  await db.insert(activityTable).values({ user_id: user.id, action: ActivityAction.SIGN_IN })

  return { agent, user_id: user.id, primary_email: user.primary_email }
})

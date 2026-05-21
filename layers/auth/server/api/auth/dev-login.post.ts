import { ActivityAction, activityTable, userTable } from '@nuxthub/db/schema'
import { kv } from '@nuxthub/kv'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { simplifyNanoId } from '~~/shared/utils/id'

const DevLoginSchema = z.object({
  email: z.email(),
})

export default defineEventHandler(async (event) => {
  if (!import.meta.dev && process.env.NUXT_DEMO_MODE !== 'true') {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const { email } = await readValidatedBody(event, DevLoginSchema.parse)

  const [user] = await db.select().from(userTable).where(eq(userTable.primary_email, email)).limit(1)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const sessionId = simplifyNanoId()

  await kv.set(`session:${sessionId}`, {
    id: user.id,
    primary_email: user.primary_email,
    primary_phone: user.primary_phone,
    username: user.username,
    name: user.name,
    avatar: user.avatar,
    verified: user.verified,
    provider: 'dev-login',
    abilities: user.abilities ?? [],
  })

  setCookie(event, 'sessionid', sessionId, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  await db.update(userTable)
    .set({ last_sign_in_at: new Date() })
    .where(eq(userTable.id, user.id))

  await db.insert(activityTable).values({ user_id: user.id, action: ActivityAction.SIGN_IN })

  return { session_id: sessionId, user_id: user.id }
})

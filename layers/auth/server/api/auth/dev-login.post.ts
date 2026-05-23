import { ActivityAction, activityTable, userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { persistSession } from '#layers/auth/server/services/session'

const DevLoginSchema = z.object({
  email: z.email(),
})

export default defineEventHandler(async (event) => {
  if (!import.meta.dev && process.env.NUXT_DEMO_MODE !== 'true') {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const { email } = await readValidatedBody(event, DevLoginSchema.parse)

  const user = await db.query.userTable.findFirst({ where: eq(userTable.primary_email, email) })
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const { sessionId } = await persistSession(event, user, { provider: 'dev-login' })

  await db.update(userTable)
    .set({ last_sign_in_at: new Date() })
    .where(eq(userTable.id, user.id))

  await db.insert(activityTable).values({ user_id: user.id, action: ActivityAction.SIGN_IN })

  return { session_id: sessionId, user_id: user.id }
})

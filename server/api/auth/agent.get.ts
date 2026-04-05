import { eq } from 'drizzle-orm'
import { ActivityAction, activityTable, userTable } from '~~/server/db/pg/schema'
import { getPgClient } from '~~/server/utils/pg'
import { simplifyNanoId } from '~~/shared/utils/id'

export default defineEventHandler(async (event) => {
  // Block in production
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const db = getPgClient()
  const now = new Date()

  const email = 'agent@localhost'

  // Upsert fake user
  const existing = await db.select().from(userTable).where(eq(userTable.primary_email, email)).limit(1)

  let user = existing[0]

  if (!user) {
    const [newUser] = await db.insert(userTable).values({
      primary_email: email,
      name: 'Agent',
      username: 'agent',
      primary_phone: '+0000000000',
      verified: true,
      last_sign_in_at: now,
    }).returning()
    user = newUser!
    await db.insert(activityTable).values({ user_id: user.id, action: ActivityAction.SIGN_UP })
  }
  else {
    const [updated] = await db.update(userTable)
      .set({ last_sign_in_at: now, updated_at: now })
      .where(eq(userTable.id, user.id))
      .returning()
    user = updated!
  }

  // Create session in Redis
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
    provider: 'agent',
  })

  setCookie(event, 'sessionid', sessionId, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  await db.insert(activityTable).values({ user_id: user.id, action: ActivityAction.SIGN_IN })

  return sendRedirect(event, '/dashboard')
})

import { ActivityAction, activityTable, userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { createPersonalOrganization } from '#layers/auth/server/services/organization'
import { persistSession } from '#layers/auth/server/services/session'

export default defineEventHandler(async (event) => {
  // Block in production
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

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
    await (useNitroApp().hooks as { callHook: (event: string, ...args: unknown[]) => Promise<void> }).callHook('auth:user-created', { user, provider: 'agent', event })
  }
  else {
    const [updated] = await db.update(userTable)
      .set({ last_sign_in_at: now, updated_at: now })
      .where(eq(userTable.id, user.id))
      .returning()
    user = updated!
  }

  // The agent owns a personal org (admin of its own workspace) so its session
  // carries working abilities.
  await createPersonalOrganization(user)
  await persistSession(event, user, { provider: 'agent' })

  await db.insert(activityTable).values({ user_id: user.id, action: ActivityAction.SIGN_IN })

  return sendRedirect(event, '/dashboard')
})

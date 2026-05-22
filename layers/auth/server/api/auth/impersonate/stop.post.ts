import type { AuthUser } from '#layers/auth/server/services/auth'
import { ActivityAction, activityTable, userTable } from '@nuxthub/db/schema'
import { kv } from '@nuxthub/kv'
import { eq } from 'drizzle-orm'
import { defineAuthenticatedHandler } from '#layers/auth/server/services/auth'
import { backupKey } from '#layers/auth/server/services/impersonate'
import { isMember } from '#layers/auth/server/services/organization'
import { buildSession, writeSession } from '#layers/auth/server/services/session'

export default defineAuthenticatedHandler(async (event, session) => {
  if (!session.impersonator) {
    throw createError({ statusCode: 400, statusMessage: 'Not currently impersonating.' })
  }

  const sessionId = getCookie(event, 'sessionid') || getHeader(event, 'x-session-id')
  if (!sessionId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const original = await kv.get<AuthUser>(backupKey(sessionId))
  if (!original) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Original session backup missing. Please log in again.',
    })
  }

  const [admin] = await db.select().from(userTable).where(eq(userTable.id, original.id)).limit(1)
  if (!admin) {
    throw createError({ statusCode: 500, statusMessage: 'Original user no longer exists.' })
  }

  // Re-validate the admin's previous active org (membership may have changed).
  const activeOrganizationId = original.activeOrganizationId
    && (await isMember(original.id, original.activeOrganizationId))
    ? original.activeOrganizationId
    : undefined
  const restored = await buildSession(admin, { provider: original.provider, activeOrganizationId })

  await writeSession(sessionId, restored)
  await kv.del(backupKey(sessionId))

  await db.insert(activityTable).values({
    user_id: original.id,
    action: ActivityAction.IMPERSONATE_STOP,
    action_ref_id: session.id,
    metadata: { target_id: session.id, target_email: session.primary_email },
  })

  return restored
})

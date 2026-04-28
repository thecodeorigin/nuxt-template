import type { AuthUser } from '~~/server/utils/auth'
import { ActivityAction, activityTable } from '~~/server/db/pg/schema'
import { backupKey, sessionKey } from '~~/server/utils/impersonate'
import { getPgClient } from '~~/server/utils/pg'

export default defineAuthenticatedHandler(async (event, session) => {
  if (!session.impersonator) {
    throw createError({ statusCode: 400, statusMessage: 'Not currently impersonating.' })
  }

  const sessionId = getCookie(event, 'sessionid') || getHeader(event, 'x-session-id')
  if (!sessionId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const storage = useStorage('redis')
  const original = await storage.getItem<AuthUser>(backupKey(sessionId))
  if (!original) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Original session backup missing. Please log in again.',
    })
  }

  const restored: AuthUser = { ...original, impersonator: null }

  await storage.setItem(sessionKey(sessionId), restored)
  await storage.removeItem(backupKey(sessionId))

  const db = getPgClient()
  await db.insert(activityTable).values({
    user_id: original.id,
    action: ActivityAction.IMPERSONATE_STOP,
    action_ref_id: session.id,
    metadata: { target_id: session.id, target_email: session.primary_email },
  })

  return restored
})

import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import {
  backupKey,
  buildImpersonatedSession,
  IMPERSONATE_ABILITY,
  impersonatorInfoFromSession,
  sessionKey,
} from '#layers/auth/server/services/impersonate'
import { ImpersonateStartSchema } from '#layers/auth/shared/schemas/impersonate'
import { eq } from 'drizzle-orm'
import { ActivityAction, activityTable, userTable } from '~~/server/db/pg/schema'
import { getPgClient } from '~~/server/utils/pg'

export default defineAuthorizedHandler(
  [IMPERSONATE_ABILITY],
  async (event, { session }) => {
    if (session.impersonator) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Already impersonating. Stop the current impersonation first.',
      })
    }

    const { user_id } = await readValidatedBody(event, ImpersonateStartSchema.parse)

    if (user_id === session.id) {
      throw createError({ statusCode: 400, statusMessage: 'Cannot impersonate yourself.' })
    }

    const sessionId = getCookie(event, 'sessionid') || getHeader(event, 'x-session-id')
    if (!sessionId) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const db = getPgClient()
    const [target] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, user_id))
      .limit(1)

    if (!target) {
      throw createError({ statusCode: 404, statusMessage: 'Target user not found.' })
    }

    if (target.is_suspended) {
      throw createError({ statusCode: 403, statusMessage: 'Cannot impersonate a suspended user.' })
    }

    const storage = useStorage('redis')
    const impersonator = impersonatorInfoFromSession(session)
    const newSession = buildImpersonatedSession(target, impersonator)

    await storage.setItem(backupKey(sessionId), session)
    await storage.setItem(sessionKey(sessionId), newSession)

    await db.insert(activityTable).values({
      user_id: session.id,
      action: ActivityAction.IMPERSONATE_START,
      action_ref_id: target.id,
      metadata: { target_id: target.id, target_email: target.primary_email },
    })

    return newSession
  },
)

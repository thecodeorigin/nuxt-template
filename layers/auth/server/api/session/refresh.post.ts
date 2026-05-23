import { userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { defineAuthenticatedHandler } from '#layers/auth/server/services/auth'
import { defaultActiveOrganizationId, isMember } from '#layers/auth/server/services/organization'
import { buildSession, writeSession } from '#layers/auth/server/services/session'

export default defineAuthenticatedHandler(async (event, session) => {
  const sessionId = getCookie(event, 'sessionid') || getHeader(event, 'x-session-id')
  if (!sessionId)
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const user = await db.query.userTable.findFirst({ where: eq(userTable.id, session.id) })
  if (!user)
    throw createError({ statusCode: 404, statusMessage: 'User not found' })

  let activeOrganizationId = session.activeOrganizationId
  if (activeOrganizationId && !(await isMember(session.id, activeOrganizationId)))
    activeOrganizationId = await defaultActiveOrganizationId(session.id)

  const next = await buildSession(user, {
    provider: session.provider,
    activeOrganizationId,
    impersonator: session.impersonator,
  })
  await writeSession(sessionId, next)
  return next
})

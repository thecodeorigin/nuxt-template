import { userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { defineAuthenticatedHandler } from '#layers/auth/server/services/auth'
import { getSystemOrganizationId, isMember } from '#layers/auth/server/services/organization'
import { buildSession, writeSession } from '#layers/auth/server/services/session'
import { SwitchOrganizationSchema } from '#layers/auth/shared/schemas/organization'

export default defineAuthenticatedHandler(async (event, session) => {
  const { organization_id } = await readValidatedBody(event, SwitchOrganizationSchema.parse)

  if (organization_id === await getSystemOrganizationId())
    throw createError({ statusCode: 400, statusMessage: 'Cannot switch into the system organization' })

  if (!(await isMember(session.id, organization_id)))
    throw createError({ statusCode: 403, statusMessage: 'Not a member of that organization' })

  const sessionId = getCookie(event, 'sessionid') || getHeader(event, 'x-session-id')
  if (!sessionId)
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const user = await db.query.userTable.findFirst({ where: eq(userTable.id, session.id) })
  if (!user)
    throw createError({ statusCode: 404, statusMessage: 'User not found' })

  const next = await buildSession(user, {
    provider: session.provider,
    activeOrganizationId: organization_id,
    impersonator: session.impersonator,
  })
  await writeSession(sessionId, next)
  return next
})

import { createError, getRouterParam } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { revokeInvitation } from '#layers/auth/server/services/organization'

export default defineAuthorizedHandler(['user:manage'], async (event, { session }) => {
  const orgId = session.activeOrganizationId
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Missing invitation id' })
  await revokeInvitation(id, orgId)
  return { ok: true }
})

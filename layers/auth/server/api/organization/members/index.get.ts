import { createError } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { getOrgMembers } from '#layers/auth/server/services/organization'

export default defineAuthorizedHandler(['user:read'], async (_event, { session }) => {
  if (!session.activeOrganizationId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  return getOrgMembers(session.activeOrganizationId)
})

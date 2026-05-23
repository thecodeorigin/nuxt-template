import { createError } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { getOrgInvitations } from '#layers/auth/server/services/organization'

export default defineAuthorizedHandler(['user:read'], async (_event, { session }) => {
  if (!session.activeOrganizationId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  return getOrgInvitations(session.activeOrganizationId)
})

import { createError, getValidatedQuery } from 'h3'
import { ListQuerySchema } from '~~/shared/schemas/pagination'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { getOrgMembersPage } from '#layers/auth/server/services/organization'

export default defineAuthorizedHandler(['user:read'], async (event, { session }) => {
  const orgId = session.activeOrganizationId
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  const query = await getValidatedQuery(event, ListQuerySchema.parse)
  return getOrgMembersPage(orgId, query)
})

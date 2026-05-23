import { getValidatedQuery } from 'h3'
import { ListQuerySchema } from '~~/shared/schemas/pagination'
import { defineAuthenticatedHandler } from '#layers/auth/server/services/auth'
import { getUserOrganizationsPage } from '#layers/auth/server/services/organization'

export default defineAuthenticatedHandler(async (event, session) => {
  const query = await getValidatedQuery(event, ListQuerySchema.parse)
  return getUserOrganizationsPage(session.id, query)
})

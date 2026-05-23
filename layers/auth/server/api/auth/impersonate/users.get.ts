import { getValidatedQuery } from 'h3'
import { ListQuerySchema } from '~~/shared/schemas/pagination'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { IMPERSONATE_ABILITY } from '#layers/auth/server/services/impersonate'
import { getImpersonationCandidatesPage } from '#layers/auth/server/services/organization'

export default defineAuthorizedHandler([IMPERSONATE_ABILITY], async (event, { session }) => {
  const query = await getValidatedQuery(event, ListQuerySchema.parse)
  return getImpersonationCandidatesPage(session.id, query)
})

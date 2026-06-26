import { getRouterParam } from 'h3'
import { getUserTicket } from '#layers/support/server/services/ticket'

export default defineAuthenticatedHandler(async (event, session) => {
  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  return getUserTicket(session.sub, id)
})

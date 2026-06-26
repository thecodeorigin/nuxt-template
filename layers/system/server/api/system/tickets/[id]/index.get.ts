import { getRouterParam } from 'h3'
import { defineAuthorizedHandler } from '~~/server/utils/auth'
import { getAgentTicket } from '#layers/support/server/services/ticket'

export default defineAuthorizedHandler(['support:manage'], async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  return getAgentTicket(id)
})

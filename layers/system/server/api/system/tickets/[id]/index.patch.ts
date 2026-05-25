import { getRouterParam, readValidatedBody } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { updateTicket } from '#layers/support/server/services/ticket'
import { UpdateTicketSchema } from '#layers/support/shared/schemas/ticket'

export default defineAuthorizedHandler(['support:manage'], async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  const patch = await readValidatedBody(event, UpdateTicketSchema.parse)
  return updateTicket(id, { status: patch.status, assignedTo: patch.assignedTo })
})

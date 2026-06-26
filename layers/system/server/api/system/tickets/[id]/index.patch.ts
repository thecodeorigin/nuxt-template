import type { H3Event } from 'h3'
import { getRouterParam, readValidatedBody } from 'h3'
import { updateTicket } from '#layers/support/server/services/ticket'
import { UpdateTicketSchema } from '#layers/support/shared/schemas/ticket'

async function patchTicket(event: H3Event, id: string): Promise<unknown> {
  const patch = await readValidatedBody(event, UpdateTicketSchema.parse)
  return updateTicket(id, { status: patch.status, assignedTo: patch.assignedTo })
}

export default defineAuthorizedHandler(['support:manage'], async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  return patchTicket(event, id)
})

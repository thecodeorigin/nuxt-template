import { getValidatedQuery } from 'h3'
import { listUserTickets } from '#layers/support/server/services/ticket'
import { TicketListQuerySchema } from '#layers/support/shared/schemas/ticket'

export default defineAuthenticatedHandler(async (event, session) => {
  const { offset, limit } = await getValidatedQuery(event, TicketListQuerySchema.parse)
  return listUserTickets(session.sub, offset, limit)
})

import { getValidatedQuery } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { listAgentTickets } from '#layers/support/server/services/ticket'
import { AgentTicketListQuerySchema } from '#layers/support/shared/schemas/ticket'

export default defineAuthorizedHandler(['support:manage'], async (event, { session }) => {
  const q = await getValidatedQuery(event, AgentTicketListQuerySchema.parse)
  return listAgentTickets({
    agentId: session.id,
    offset: q.offset,
    limit: q.limit,
    status: q.status,
    kind: q.kind,
    mineOnly: q.mineOnly,
    search: q.search,
  })
})

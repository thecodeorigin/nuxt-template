import type { H3Event } from 'h3'
import { getValidatedQuery } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { listAgentTickets } from '#layers/support/server/services/ticket'
import { AgentTicketListQuerySchema } from '#layers/support/shared/schemas/ticket'

async function listTickets(event: H3Event, agentId: string): Promise<unknown> {
  const q = await getValidatedQuery(event, AgentTicketListQuerySchema.parse)
  return listAgentTickets({
    agentId,
    offset: q.offset,
    limit: q.limit,
    status: q.status,
    kind: q.kind,
    mineOnly: q.mineOnly,
    search: q.search,
  })
}

export default defineAuthorizedHandler(['support:manage'], async (event, { session }) => {
  return listTickets(event, session.id)
})

import type { z } from 'zod'
import type { CreateTicket, TicketDetail, TicketListQuerySchema, TicketSummary } from '#layers/support/shared/schemas/ticket'

type ListQuery = z.infer<typeof TicketListQuerySchema>

export function useSupportApi() {
  function createTicket(payload: CreateTicket) {
    return $http<TicketDetail>('/api/support/tickets', { method: 'POST', body: payload })
  }
  function fetchTickets(query: Partial<ListQuery> = {}) {
    return $http<{ items: TicketSummary[], hasMore: boolean }>('/api/support/tickets', { query: { ...query } })
  }
  function fetchTicket(id: string) {
    return $http<TicketDetail>('/api/support/tickets/:id', { query: { id } })
  }
  function postMessage(id: string, body: string) {
    return $http<TicketDetail>('/api/support/tickets/:id/messages', { method: 'POST', query: { id }, body: { body } })
  }
  return { createTicket, fetchTickets, fetchTicket, postMessage }
}

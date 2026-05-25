import type { AgentTicketListQuery, TicketDetail, TicketSummary, UpdateTicket } from '#layers/support/shared/schemas/ticket'

export function useSystemTicketApi() {
  function fetchTickets(query: Partial<AgentTicketListQuery> = {}) {
    return $http<{ items: TicketSummary[], hasMore: boolean }>('/api/system/tickets', { query: { ...query } })
  }
  function fetchTicket(id: string) {
    return $http<TicketDetail>('/api/system/tickets/:id', { query: { id } })
  }
  function postMessage(id: string, body: string) {
    return $http<TicketDetail>('/api/system/tickets/:id/messages', { method: 'POST', query: { id }, body: { body } })
  }
  function updateTicket(id: string, patch: UpdateTicket) {
    return $http<TicketDetail>('/api/system/tickets/:id', { method: 'PATCH', query: { id }, body: patch })
  }
  return { fetchTickets, fetchTicket, postMessage, updateTicket }
}

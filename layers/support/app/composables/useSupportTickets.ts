import type { InjectionKey, Ref } from 'vue'
import type { TicketDetail, TicketSummary } from '#layers/support/shared/schemas/ticket'

export interface SupportTicketsContext {
  tickets: Ref<TicketSummary[]>
  selected: Ref<TicketDetail | null>
  selectTicket: (id: string) => Promise<void>
  sendReply: (body: string) => Promise<void>
}

export const supportTicketsKey: InjectionKey<SupportTicketsContext> = Symbol('supportTickets')

export function useSupportTickets(): SupportTicketsContext {
  const ctx = inject(supportTicketsKey)
  if (!ctx)
    throw new Error('useSupportTickets must be used within the /support page')
  return ctx
}

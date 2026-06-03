import type { SupportTicketMessageRow, SupportTicketRow } from '@nuxthub/db/schema'
import { TICKET_CATEGORIES, TICKET_KINDS, TICKET_STATUSES } from '@nuxthub/db/schema'
import { z } from 'zod'

export const TicketKindSchema = z.enum(TICKET_KINDS)
export const TicketCategorySchema = z.enum(TICKET_CATEGORIES)
export const TicketStatusSchema = z.enum(TICKET_STATUSES)

const subject = z.string().trim().min(1).max(200)
const messageBody = z.string().trim().min(1).max(5000)

export const CreateTicketSchema = z.object({
  kind: TicketKindSchema,
  category: TicketCategorySchema.optional(),
  subject,
  body: messageBody,
}).refine(v => v.kind === 'feedback' ? v.category === undefined : v.category !== undefined, {
  message: 'Support requests require a category; feedback must not have one.',
  path: ['category'],
})

export const PostMessageSchema = z.object({ body: messageBody })

export const TicketListQuerySchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export const AgentTicketListQuerySchema = TicketListQuerySchema.extend({
  status: TicketStatusSchema.optional(),
  kind: TicketKindSchema.optional(),
  mineOnly: z.preprocess(v => v === undefined ? undefined : (v === 'true' || v === true), z.boolean().optional()),
  search: z.string().trim().max(200).optional(),
})

export const UpdateTicketSchema = z.object({
  status: TicketStatusSchema.optional(),
  assignedTo: z.string().nullable().optional(),
}).refine(v => v.status !== undefined || v.assignedTo !== undefined, {
  message: 'Provide status and/or assignedTo.',
})

export interface TicketSummary {
  id: string
  kind: typeof TICKET_KINDS[number]
  category: typeof TICKET_CATEGORIES[number] | null
  subject: string
  status: typeof TICKET_STATUSES[number]
  assignedTo: string | null
  lastMessageAt: string
  lastMessageRole: 'user' | 'agent'
  createdAt: string
}

export interface TicketMessage {
  id: string
  authorRole: 'user' | 'agent'
  body: string
  createdAt: string
}

export interface TicketRequester {
  id: string
  name: string | null
  email: string
}

export interface TicketDetail extends TicketSummary {
  messages: TicketMessage[]
  requester?: TicketRequester
}

export type CreateTicket = z.infer<typeof CreateTicketSchema>
export type AgentTicketListQuery = z.infer<typeof AgentTicketListQuerySchema>
export type UpdateTicket = z.infer<typeof UpdateTicketSchema>
export type TicketStatus = z.infer<typeof TicketStatusSchema>

export function toTicketSummary(row: SupportTicketRow): TicketSummary {
  return {
    id: row.id,
    kind: row.kind,
    category: row.category ?? null,
    subject: row.subject,
    status: row.status,
    assignedTo: row.assigned_to ?? null,
    lastMessageAt: row.last_message_at.toISOString(),
    lastMessageRole: row.last_message_role,
    createdAt: row.created_at.toISOString(),
  }
}

export function toTicketMessage(row: SupportTicketMessageRow): TicketMessage {
  return {
    id: row.id,
    authorRole: row.author_role,
    body: row.body,
    createdAt: row.created_at.toISOString(),
  }
}

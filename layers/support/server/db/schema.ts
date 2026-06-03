import type { InferSelect } from '~~/server/db/types'
import { organizationTable, userTable } from '@nuxthub/db/schema'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const TICKET_KINDS = ['feedback', 'support'] as const
export const TICKET_CATEGORIES = ['account', 'billing', 'technical', 'other'] as const
export const TICKET_STATUSES = ['open', 'active', 'closed'] as const
export const MESSAGE_ROLES = ['user', 'agent'] as const

export type TicketKind = typeof TICKET_KINDS[number]
export type TicketCategory = typeof TICKET_CATEGORIES[number]
export type TicketStatus = typeof TICKET_STATUSES[number]
export type MessageRole = typeof MESSAGE_ROLES[number]

export const supportTicketTable = sqliteTable('support_tickets', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').references(() => userTable.id, { onDelete: 'cascade' }).notNull(),
  organization_id: text('organization_id').references(() => organizationTable.id, { onDelete: 'cascade' }).notNull(),
  kind: text('kind', { enum: TICKET_KINDS }).notNull(),
  category: text('category', { enum: TICKET_CATEGORIES }),
  subject: text('subject').notNull(),
  status: text('status', { enum: TICKET_STATUSES }).notNull().default('open'),
  assigned_to: text('assigned_to').references(() => userTable.id, { onDelete: 'set null' }),
  last_message_at: integer('last_message_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  last_message_role: text('last_message_role', { enum: MESSAGE_ROLES }).notNull().default('user'),
  reminder_sent_at: integer('reminder_sent_at', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  index('support_tickets_user_idx').on(table.user_id),
  index('support_tickets_status_idx').on(table.status),
  index('support_tickets_assigned_idx').on(table.assigned_to),
  index('support_tickets_reminder_idx').on(table.last_message_role, table.last_message_at),
])
export type SupportTicketRow = InferSelect<typeof supportTicketTable>

export const supportTicketMessageTable = sqliteTable('support_ticket_messages', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  ticket_id: text('ticket_id').references(() => supportTicketTable.id, { onDelete: 'cascade' }).notNull(),
  author_id: text('author_id').references(() => userTable.id, { onDelete: 'set null' }),
  author_role: text('author_role', { enum: MESSAGE_ROLES }).notNull(),
  body: text('body').notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, table => [
  index('support_ticket_messages_ticket_idx').on(table.ticket_id, table.created_at),
])
export type SupportTicketMessageRow = InferSelect<typeof supportTicketMessageTable>

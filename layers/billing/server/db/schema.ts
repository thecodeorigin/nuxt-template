import type { InferSelect } from '~~/server/db/types'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { organizationTable, userTable } from '#layers/auth/server/db/schema'

export const organizationCreditTable = sqliteTable('organization_credits', {
  organization_id: text('organization_id').primaryKey().references(() => organizationTable.id, { onDelete: 'cascade' }),
  balance: integer('balance').notNull().default(0),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})
export type OrganizationCredit = InferSelect<typeof organizationCreditTable>

export const transactionTable = sqliteTable('transactions', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  organization_id: text('organization_id').references(() => organizationTable.id, { onDelete: 'cascade' }).notNull(),
  user_id: text('user_id').references(() => userTable.id, { onDelete: 'set null' }),
  type: text('type', { enum: ['top_up', 'referral_reward'] }).notNull(),
  status: text('status', { enum: ['pending', 'success', 'failed', 'expired'] }).notNull().default('pending'),
  amount: integer('amount').notNull(),
  gateway_ref: text('gateway_ref').unique(),
  sepay_event_id: text('sepay_event_id').unique(),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>().default({}),
  expires_at: integer('expires_at', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  index('transactions_org_idx').on(table.organization_id),
  index('transactions_status_idx').on(table.status),
])
export type Transaction = InferSelect<typeof transactionTable>

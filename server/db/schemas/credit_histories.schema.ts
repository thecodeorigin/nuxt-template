import { numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { creditHistoryType } from './enum.schema'

export const creditHistoryTable = pgTable('credit_histories', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  amount: numeric('amount').notNull(),
  type: creditHistoryType('type').notNull(),
  user_id: text('user_id').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

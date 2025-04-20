import { numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { creditHistoryType } from './enum.schema'
import { userTable } from './users.schema'

export const creditHistoryTable = pgTable('credit_histories', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  amount: numeric('amount').notNull(),
  type: creditHistoryType('type').notNull(),
  user_id: uuid('user_id')
    .references(() => userTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const creditHistoryRelations = relations(creditHistoryTable, ({ one }) => ({
  user: one(userTable, {
    fields: [creditHistoryTable.user_id],
    references: [userTable.id],
  }),
}))

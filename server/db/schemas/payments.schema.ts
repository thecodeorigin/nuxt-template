import { integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { orderTable } from './orders.schema'
import { paymentStatus } from './enum.schema'
import { paymentProviderTransactionTable } from './payment_provider_transactions.schema'
import { userTable } from './users.schema'

export const paymentTable = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  amount: integer('amount').notNull(),
  status: paymentStatus('status').notNull(),
  order_id: uuid('order_id')
    .references(() => orderTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
  user_id: uuid('user_id')
    .references(() => userTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
})

export const userPaymentRelations = relations(paymentTable, ({ one }) => ({
  order: one(orderTable, {
    fields: [paymentTable.order_id],
    references: [orderTable.id],
  }),
  providerTransaction: one(paymentProviderTransactionTable, {
    fields: [paymentTable.id],
    references: [paymentProviderTransactionTable.payment_id],
  }),
  user: one(userTable, {
    fields: [paymentTable.user_id],
    references: [userTable.id],
  }),
}))

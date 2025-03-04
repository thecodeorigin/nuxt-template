import { numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { userOrderTable } from './user_orders.schema'
import { paymentStatus } from './enum.schema'
import { paymentProviderTransactionTable } from './payment_provider_transactions.schema'

export const userPaymentTable = pgTable('user_payments', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  amount: numeric('amount').notNull(),
  status: paymentStatus('status').notNull(),
  order_id: uuid('order_id')
    .references(() => userOrderTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
  user_id: text('user_id').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
})

export const userPaymentRelations = relations(userPaymentTable, ({ one }) => ({
  order: one(userOrderTable, {
    fields: [userPaymentTable.order_id],
    references: [userOrderTable.id],
  }),
  providerTransaction: one(paymentProviderTransactionTable, {
    fields: [userPaymentTable.id],
    references: [paymentProviderTransactionTable.payment_id],
  }),
}))

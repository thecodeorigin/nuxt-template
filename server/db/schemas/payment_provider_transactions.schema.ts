import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { userPaymentTable } from './user_payments.schema'

export const paymentProviderTransactionTable = pgTable('payment_provider_transactions', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  provider: text('provider').notNull(),
  provider_transaction_id: text('provider_transaction_id'), // vnp_TransactionNo
  provider_transaction_status: text('provider_transaction_status').notNull(), // vnp_TransactionStatus
  provider_transaction_resolved_at: timestamp('provider_transaction_resolved_at', { withTimezone: true }), // vnp_PayDate
  provider_transaction_info: text('provider_transaction_info').notNull(), // vnp_OrderInfo
  payment_id: uuid('payment_id')
    .references(() => userPaymentTable.id, { onDelete: 'no action', onUpdate: 'no action' }).notNull(),
  user_id: text('user_id').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
})

export const paymentProviderTransactionRelations = relations(paymentProviderTransactionTable, ({ one }) => ({
  payment: one(userPaymentTable, {
    fields: [paymentProviderTransactionTable.payment_id],
    references: [userPaymentTable.id],
  }),
}))

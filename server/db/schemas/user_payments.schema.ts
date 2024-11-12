import { numeric, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { sysUserTable } from './sys_users.schema'
import { userOrderTable } from './user_orders.schema'
import { paymentStatus } from './enum.schema'
import { paymentProviderTransactionTable } from './payment_provider_transactions.schema'

export const userPaymentTable = pgTable('user_payments', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  amount: numeric('amount').notNull(),
  status: paymentStatus('status').notNull(),
  order_id: uuid('order_id')
    .references(() => userOrderTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
  user_id: uuid('user_id')
    .references(() => sysUserTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
})

export const userPaymentRelations = relations(userPaymentTable, ({ one }) => ({
  order: one(userOrderTable, {
    fields: [userPaymentTable.order_id],
    references: [userOrderTable.id],
  }),
  user: one(sysUserTable, {
    fields: [userPaymentTable.user_id],
    references: [sysUserTable.id],
  }),
  providerTransaction: one(paymentProviderTransactionTable, {
    fields: [userPaymentTable.id],
    references: [paymentProviderTransactionTable.payment_id],
  }),
}))

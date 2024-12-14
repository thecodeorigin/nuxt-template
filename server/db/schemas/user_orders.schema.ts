import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { userPaymentTable } from './user_payments.schema'

export const userOrderTable = pgTable('user_orders', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  user_id: text('user_id').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
})

export const userOrderRelations = relations(userOrderTable, ({ one }) => ({
  payment: one(userPaymentTable, {
    fields: [userOrderTable.id],
    references: [userPaymentTable.order_id],
  }),
}))

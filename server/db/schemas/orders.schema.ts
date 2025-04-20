import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { paymentTable } from './payments.schema'
import { productTable } from './products.schema'
import { userTable } from './users.schema'

export const orderTable = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  user_id: uuid('user_id')
    .references(() => userTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
  product_id: uuid('product_id')
    .references(() => productTable.id, { onDelete: 'no action', onUpdate: 'no action' }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
})

export const userOrderRelations = relations(orderTable, ({ one }) => ({
  package: one(productTable, {
    fields: [orderTable.product_id],
    references: [productTable.id],
  }),
  payment: one(paymentTable, {
    fields: [orderTable.id],
    references: [paymentTable.order_id],
  }),
  user: one(userTable, {
    fields: [orderTable.user_id],
    references: [userTable.id],
  }),
}))

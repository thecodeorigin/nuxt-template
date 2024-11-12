import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { sysUserTable } from './sys_users.schema'
import { userPaymentTable } from './user_payments.schema'

export const userOrderTable = pgTable('user_orders', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  user_id: uuid('user_id')
    .references(() => sysUserTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
})

export const userOrderRelations = relations(userOrderTable, ({ one }) => ({
  payment: one(userPaymentTable, {
    fields: [userOrderTable.id],
    references: [userPaymentTable.order_id],
  }),
  user: one(sysUserTable, {
    fields: [userOrderTable.user_id],
    references: [sysUserTable.id],
  }),
}))

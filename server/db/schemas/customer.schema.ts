import { foreignKey, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { sysUserTable } from './sys_users.schema'

export const customerTable = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  stripe_customer_id: text('stripe_customer_id').notNull(),
  user_id: uuid('user_id').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    stripeCustomerIdUnique: unique('stripe_customer_id_unique').on(table.stripe_customer_id),
    customerUserIdFkey: foreignKey({
      columns: [table.user_id],
      foreignColumns: [sysUserTable.id],
      name: 'customer_user_id_fkey',
    }),
  }
})

export const insertCustomerSchema = createInsertSchema(customerTable)

export const selectCustomerSchema = createSelectSchema(customerTable)

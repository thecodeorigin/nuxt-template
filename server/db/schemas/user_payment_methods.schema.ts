import { date, foreignKey, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { sysUserTable } from './sys_users.schema'

export const userPaymentMethodTable = pgTable('user_payment_methods', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  number: text('number').notNull(),
  placeholder: text('placeholder').notNull(),
  cvv: numeric('cvv').notNull(),
  expiresAt: date('expires_at').notNull(),
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => {
  return {
    publicUserPaymentMethodsUserIdFkey: foreignKey({
      columns: [table.userId],
      foreignColumns: [sysUserTable.id],
      name: 'public_user_payment_methods_user_id_fkey',
    }).onDelete('cascade'),
  }
})

export const insertUserPaymentMethodSchema = createInsertSchema(userPaymentMethodTable)

export const selectUserPaymentMethodSchema = createSelectSchema(userPaymentMethodTable)

export const userPaymentMethodRelations = relations(userPaymentMethodTable, ({ one }) => ({
  sysUser: one(sysUserTable, {
    fields: [userPaymentMethodTable.userId],
    references: [sysUserTable.id],
  }),
}))
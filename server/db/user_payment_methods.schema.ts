import { date, foreignKey, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { sysUserSchema } from './sys_users.schema'

export const userPaymentMethodSchema = pgTable('user_payment_methods', {
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
      foreignColumns: [sysUserSchema.id],
      name: 'public_user_payment_methods_user_id_fkey',
    }).onDelete('cascade'),
  }
})

export const userPaymentMethodsRelations = relations(userPaymentMethodSchema, ({ one }) => ({
  sysUser: one(sysUserSchema, {
    fields: [userPaymentMethodSchema.userId],
    references: [sysUserSchema.id],
  }),
}))

import { date, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { sysUserTable } from '.'

export const userPaymentMethodTable = pgTable('user_payment_methods', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  number: text('number').notNull(),
  placeholder: text('placeholder').notNull(),
  cvv: numeric('cvv').notNull(),
  expires_at: date('expires_at').notNull(),
  user_id: uuid('user_id')
    .references(() => sysUserTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
})

export const insertUserPaymentMethodSchema = createInsertSchema(userPaymentMethodTable)

export const selectUserPaymentMethodSchema = createSelectSchema(userPaymentMethodTable)

export const userPaymentMethodRelations = relations(userPaymentMethodTable, ({ one }) => ({
  owner: one(sysUserTable, {
    fields: [userPaymentMethodTable.user_id],
    references: [sysUserTable.id],
  }),
}))

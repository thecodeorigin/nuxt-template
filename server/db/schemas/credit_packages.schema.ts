import { jsonb, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const creditPackageTable = pgTable('credit_packages', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  price: numeric('price').notNull(),
  currency: text('currency').notNull(),
  amount: numeric('amount').notNull(),
  features: jsonb('features'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
})

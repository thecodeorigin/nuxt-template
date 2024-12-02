import { numeric, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'

export const creditPackageTable = pgTable('credit_packages', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  price: numeric('amount').notNull(),
  amount: numeric('amount').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
})

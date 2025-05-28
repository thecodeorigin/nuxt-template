import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { userTable } from './users.schema'
import { referenceTable } from './references.schema'
import { paymentProviderTransactionTable } from './payment_provider_transactions.schema'

export const referenceUsageTable = pgTable('reference_usages', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  // the one who uses/applies the reference code
  user_id: uuid('user_id')
    .references(() => userTable.id, { onDelete: 'no action', onUpdate: 'no action' }).notNull(),
  reference_id: uuid('reference_id')
    .references(() => referenceTable.id, { onDelete: 'no action', onUpdate: 'no action' }).notNull(),
  payment_provider_transaction_id: uuid('payment_provider_transaction_id')
    .references(() => paymentProviderTransactionTable.id, { onDelete: 'no action', onUpdate: 'no action' }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
})

export const referenceUsageRelations = relations(referenceUsageTable, ({ one }) => ({
  user: one(userTable, {
    fields: [referenceUsageTable.user_id],
    references: [userTable.id],
  }),
}))

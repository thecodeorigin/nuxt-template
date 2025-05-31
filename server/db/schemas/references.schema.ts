import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { customAlphabet } from 'nanoid'
import { userTable } from './users.schema'

export const referenceTable = pgTable('references', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  // owner, the one who created the reference code
  user_id: uuid('user_id')
    .references(() => userTable.id, { onDelete: 'no action', onUpdate: 'no action' }).notNull(),
  code: text('code').$defaultFn(() => customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 16)()),
  percentage: integer('percentage').default(0),
  amount: integer('amount').default(0), // discount amount (in VND)
  quantity: integer('quantity'), // number of times this reference code can be used
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
})

export const referenceRelations = relations(referenceTable, ({ one }) => ({
  user: one(userTable, {
    fields: [referenceTable.user_id],
    references: [userTable.id],
  }),
}))

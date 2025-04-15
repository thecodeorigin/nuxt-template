import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { userTable } from './users.schema'

export const identityTable = pgTable('identities', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  user_id: uuid('user_id')
    .references(() => userTable.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  provider: text('provider').notNull(), // e.g., 'google', 'facebook', etc.
  provider_user_id: text('provider_user_id').notNull(),
  provider_data: jsonb('provider_data').default({}),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
})

export const identityRelations = relations(identityTable, ({ one }) => ({
  user: one(userTable, {
    fields: [identityTable.user_id],
    references: [userTable.id],
  }),
}))

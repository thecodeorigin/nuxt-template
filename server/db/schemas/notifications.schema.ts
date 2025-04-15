import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { userTable } from './users.schema'

export const notificationTable = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  title: text('title'),
  message: text('message'),
  action: jsonb('action'),
  read_at: timestamp('read_at', { withTimezone: true }),
  user_id: uuid('user_id')
    .references(() => userTable.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
})

export const notificationRelations = relations(notificationTable, ({ one }) => ({
  user: one(userTable, {
    fields: [notificationTable.user_id],
    references: [userTable.id],
  }),
}))

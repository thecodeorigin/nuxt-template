import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { userTable } from './users.schema'

export const deviceTable = pgTable('devices', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  user_id: text('user_id').notNull(),
  token_device: text('token_device'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const deviceRelations = relations(deviceTable, ({ one }) => ({
  user: one(userTable, {
    fields: [deviceTable.user_id],
    references: [userTable.id],
  }),
}))

import { pgTable, text, uuid } from 'drizzle-orm/pg-core'

export const userShortcutTable = pgTable('user_shortcuts', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  route: text('route').notNull(),
  user_id: text('user_id').notNull(),
})

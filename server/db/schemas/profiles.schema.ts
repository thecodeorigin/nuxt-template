import { numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const profileTable = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  user_id: text('user_id').notNull(),
  email: text('email'),
  facebook: text('facebook'),
  zalo: text('zalo'),
  credit: numeric('credit'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

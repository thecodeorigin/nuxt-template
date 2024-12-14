import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const sysNotificationTable = pgTable('sys_notifications', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  title: text('title'),
  message: text('message'),
  action: jsonb('action'),
  read_at: timestamp('read_at', { withTimezone: true }),
  user_id: text('user_id').notNull(),
})

import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const userDeviceTable = pgTable('user_devices', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  user_id: text('user_id').notNull(),
  token_device: text('token_device'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

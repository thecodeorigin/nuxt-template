import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { sysUserTable } from './sys_users.schema'

export const sysSessionTable = pgTable('sys_sessions', {
  session_token: text('session_token').primaryKey(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => sysUserTable.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { sysUserTable } from './sys_users.schema'

export const userDeviceTable = pgTable('user_devices', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  user_id: uuid('user_id')
    .references(() => sysUserTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  token_device: text('token_device'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const userDeviceRelations = relations(userDeviceTable, ({ one }) => ({
  owner: one(sysUserTable, {
    fields: [userDeviceTable.user_id],
    references: [sysUserTable.id],
  }),
}))

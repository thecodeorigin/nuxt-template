import { bigint, foreignKey, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { sysUserTable } from './sys_users.schema'

export const userDeviceTable = pgTable('user_devices', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity({ name: 'user_devices_id_seq', startWith: 1, increment: 1, minValue: 1, maxValue: 922337203685477, cache: 1 }),
  user_id: uuid('user_id')
    .references(() => sysUserTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  token_device: text('token_device'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const insertUserDeviceSchema = createInsertSchema(userDeviceTable)

export const selectUserDeviceSchema = createSelectSchema(userDeviceTable)

export const userDeviceRelations = relations(userDeviceTable, ({ one }) => ({
  owner: one(sysUserTable, {
    fields: [userDeviceTable.user_id],
    references: [sysUserTable.id],
  }),
}))

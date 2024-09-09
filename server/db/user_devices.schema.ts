import { bigint, foreignKey, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { sysUserSchema } from './sys_users.schema'

export const userDeviceSchema = pgTable('user_devices', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity({ name: 'user_devices_id_seq', startWith: 1, increment: 1, minValue: 1, maxValue: 922337203685477, cache: 1 }),
  userId: uuid('user_id').defaultRandom(),
  tokenDevice: text('token_device'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    publicUserDevicesUserIdFkey: foreignKey({
      columns: [table.userId],
      foreignColumns: [sysUserSchema.id],
      name: 'public_user_devices_user_id_fkey',
    }).onUpdate('cascade').onDelete('cascade'),
  }
})

export const userDevicesRelations = relations(userDeviceSchema, ({ one }) => ({
  sysUser: one(sysUserSchema, {
    fields: [userDeviceSchema.userId],
    references: [sysUserSchema.id],
  }),
}))

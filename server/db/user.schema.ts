import { bigint, date, foreignKey, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'

import { sysUsers } from './sys.schema'

export const userShortcuts = pgTable('user_shortcuts', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  route: text('route').notNull(),
  userId: uuid('user_id').defaultRandom(),
}, (table) => {
  return {
    publicUserShortcutsUserIdFkey: foreignKey({
      columns: [table.userId],
      foreignColumns: [sysUsers.id],
      name: 'public_user_shortcuts_user_id_fkey',
    }).onDelete('cascade'),
  }
})

export const userPaymentMethods = pgTable('user_payment_methods', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  number: text('number').notNull(),
  placeholder: text('placeholder').notNull(),
  cvv: numeric('cvv').notNull(),
  expiresAt: date('expires_at').notNull(),
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
}, (table) => {
  return {
    publicUserPaymentMethodsUserIdFkey: foreignKey({
      columns: [table.userId],
      foreignColumns: [sysUsers.id],
      name: 'public_user_payment_methods_user_id_fkey',
    }).onDelete('cascade'),
  }
})

export const userDevices = pgTable('user_devices', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity({ name: 'user_devices_id_seq', startWith: 1, increment: 1, minValue: 1, maxValue: 922337203685477, cache: 1 }),
  userId: uuid('user_id').defaultRandom(),
  tokenDevice: text('token_device'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => {
  return {
    publicUserDevicesUserIdFkey: foreignKey({
      columns: [table.userId],
      foreignColumns: [sysUsers.id],
      name: 'public_user_devices_user_id_fkey',
    }).onUpdate('cascade').onDelete('cascade'),
  }
})

export const userShortcutsRelations = relations(userShortcuts, ({ one }) => ({
  sysUser: one(sysUsers, {
    fields: [userShortcuts.userId],
    references: [sysUsers.id],
  }),
}))

export const userPaymentMethodsRelations = relations(userPaymentMethods, ({ one }) => ({
  sysUser: one(sysUsers, {
    fields: [userPaymentMethods.userId],
    references: [sysUsers.id],
  }),
}))

export const userDevicesRelations = relations(userDevices, ({ one }) => ({
  sysUser: one(sysUsers, {
    fields: [userDevices.userId],
    references: [sysUsers.id],
  }),
}))

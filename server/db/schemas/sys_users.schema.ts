import { foreignKey, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { userStatus } from './enum.schema'
import { sysRoleTable } from './sys_roles.schema'
import { sysNotificationTable } from './sys_notifications.schema'
import { userShortcutTable } from './user_shortcuts.schema'
import { userDeviceTable } from './user_devices.schema'

export const sysUserTable = pgTable('sys_users', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  email: text('email'),
  phone: text('phone'),
  password: text('password'),
  provider: varchar('provider'),
  full_name: text('full_name'),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
  role_id: uuid('role_id').references(() => sysRoleTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  country: varchar('country'),
  language: varchar('language').default('en'),
  organization: text('organization'),
  postcode: varchar('postcode'),
  status: userStatus('status').default('pending'),
  address: text('address'),
  city: text('city'),
  emailVerified: timestamp('email_verified'),
})

export const insertSysUserSchema = createInsertSchema(sysUserTable)

export const selectSysUserSchema = createSelectSchema(sysUserTable)

export const sysUserRelations = relations(sysUserTable, ({ one, many }) => ({
  role: one(sysRoleTable, {
    fields: [sysUserTable.role_id],
    references: [sysRoleTable.id],
  }),
  userShortcuts: many(userShortcutTable),
  userDevices: many(userDeviceTable),
  notifications: many(sysNotificationTable),
}))

import { relations } from 'drizzle-orm/relations'
import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { userDeviceTable } from './user_devices.schema'
import { userShortcutTable } from './user_shortcuts.schema'

import { userStatus } from './enum.schema'
import { sysRoleTable } from './sys_roles.schema'
import { sysOrganizationTable } from './sys_organizations.schema'

export const sysUserTable = pgTable('sys_users', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  email: text('email').unique().notNull(),
  email_verified: timestamp('email_verified', { withTimezone: true }),
  phone: text('phone'),
  password: text('password'),
  full_name: text('full_name'),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
  role_id: uuid('role_id').references(() => sysRoleTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  organization_id: uuid('organization_id').references(() => sysOrganizationTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  country: varchar('country'),
  language: varchar('language').default('en'),
  organization: text('organization'),
  postcode: varchar('postcode'),
  status: userStatus('status').default('pending'),
  address: text('address'),
  city: text('city'),
})

export const sysUserRelations = relations(sysUserTable, ({ one, many }) => ({
  role: one(sysRoleTable, {
    fields: [sysUserTable.role_id],
    references: [sysRoleTable.id],
  }),
  organization: one(sysOrganizationTable, {
    fields: [sysUserTable.organization_id],
    references: [sysOrganizationTable.id],
  }),
  userShortcuts: many(userShortcutTable),
  userDevices: many(userDeviceTable),
}))

import { relations } from 'drizzle-orm/relations'
import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { userDeviceTable } from './user_devices.schema'
import { userShortcutTable } from './user_shortcuts.schema'

import { userStatus } from './enum.schema'
import { userOrderTable } from './user_orders.schema'
import { userPaymentTable } from './user_payments.schema'
import { sysOrganizationUserTable } from './sys_organization_user.schema'
import { sysRoleUserTable } from './sys_role_user.schema'

export const sysUserTable = pgTable('sys_users', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  email: text('email').unique().notNull(),
  email_verified: timestamp('email_verified', { withTimezone: true }),
  phone: text('phone'),
  password: text('password'),
  full_name: text('full_name'),
  avatar_url: text('avatar_url'),
  country: varchar('country'),
  language: varchar('language').default('en'),
  postcode: varchar('postcode'),
  status: userStatus('status').default('pending'),
  address: text('address'),
  city: text('city'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
})

export const sysUserRelations = relations(sysUserTable, ({ many }) => ({
  roles: many(sysRoleUserTable),
  organizations: many(sysOrganizationUserTable),

  userShortcuts: many(userShortcutTable),
  userDevices: many(userDeviceTable),
  orders: many(userOrderTable),
  payments: many(userPaymentTable),
}))

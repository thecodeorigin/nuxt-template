import { foreignKey, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { userStatus } from './enum.schema'
import { sysRoleTable } from './sys_roles.schema'
import { categoryTable } from './category.schema'
import { postTable } from './post.schema'
import { projectTable } from './project.schema'
import { sysNotificationTable } from './sys_notifications.schema'
import { userShortcutTable } from './user_shortcuts.schema'
import { userDeviceTable } from './user_devices.schema'
import { userPaymentMethodTable } from './user_payment_methods.schema'

export const sysUserTable = pgTable('sys_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email'),
  phone: text('phone'),
  password: text('password'),
  provider: varchar('provider'),
  full_name: text('full_name'),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
  role_id: uuid('role_id'),
  country: varchar('country'),
  language: varchar('language').default('en'),
  organization: text('organization'),
  postcode: varchar('postcode'),
  status: userStatus('status').default('pending'),
  address: text('address'),
  city: text('city'),
}, (table) => {
  return {
    publicSysUsersRoleIdFkey: foreignKey({
      columns: [table.role_id],
      foreignColumns: [sysRoleTable.id],
      name: 'public_sys_users_role_id_fkey',
    }),
  }
})

export const insertSysUserSchema = createInsertSchema(sysUserTable)

export const selectSysUserSchema = createSelectSchema(sysUserTable)

export const sysUserRelations = relations(sysUserTable, ({ one, many }) => ({
  sysRole: one(sysRoleTable, {
    fields: [sysUserTable.role_id],
    references: [sysRoleTable.id],
  }),
  categorySchema: many(categoryTable),
  postSchema: many(postTable),
  userShortcutSchema: many(userShortcutTable),
  userPaymentMethodSchema: many(userPaymentMethodTable),
  userDeviceSchema: many(userDeviceTable),
  sysNotificationSchema: many(sysNotificationTable),
  projectSchema: many(projectTable),
}))

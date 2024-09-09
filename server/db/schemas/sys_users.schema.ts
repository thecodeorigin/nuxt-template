import { foreignKey, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { userStatus } from './enum.schema'
import { sysRoleTable } from './sys_roles.schema'
import { sysShortcutTable } from './sys_shortcuts.schema'
import { categoryTable } from './category.schema'
import { postTable } from './post.schema'
import { projectTable } from './project.schema'
import { sysNotificationTable } from './sys_notifications.schema'
import { userShortcutTable } from './user_shortcuts.schema'
import { userDeviceTable } from './user_devices.schema'
import { userPaymentMethodTable } from './user_payment_methods.schema'

export const sysUserTable = pgTable('sys_users', {
  id: uuid('id').primaryKey().notNull(),
  email: text('email'),
  phone: text('phone'),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  roleId: uuid('role_id'),
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
      columns: [table.roleId],
      foreignColumns: [sysRoleTable.id],
      name: 'public_sys_users_role_id_fkey',
    }),
  }
})

export const insertSysUserSchema = createInsertSchema(sysUserTable)

export const selectSysUserSchema = createSelectSchema(sysUserTable)

export const sysUserRelations = relations(sysUserTable, ({ one, many }) => ({
  sysShortcutSchema: many(sysShortcutTable),
  sysRole: one(sysRoleTable, {
    fields: [sysUserTable.roleId],
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
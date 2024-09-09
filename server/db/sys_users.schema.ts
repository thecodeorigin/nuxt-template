import { foreignKey, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { userStatus } from './enum.schema'
import { sysRoleSchema } from './sys_roles.schema'
import { sysShortcutSchema } from './sys_shortcuts.schema'
import { categorySchema } from './category.schema'
import { postSchema } from './post.schema'
import { projectSchema } from './project.schema'
import { sysNotificationSchema } from './sys_notifications.schema'
import { userShortcutSchema } from './user_shortcuts.schema'
import { userDeviceSchema } from './user_devices.schema'
import { userPaymentMethodSchema } from './user_payment_methods.schema'

export const sysUserSchema = pgTable('sys_users', {
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
      foreignColumns: [sysRoleSchema.id],
      name: 'public_sys_users_role_id_fkey',
    }),
  }
})

export const sysUsersRelations = relations(sysUserSchema, ({ one, many }) => ({
  sysShortcutSchema: many(sysShortcutSchema),
  sysRole: one(sysRoleSchema, {
    fields: [sysUserSchema.roleId],
    references: [sysRoleSchema.id],
  }),
  categorySchema: many(categorySchema),
  postSchema: many(postSchema),
  userShortcutSchema: many(userShortcutSchema),
  userPaymentMethodSchema: many(userPaymentMethodSchema),
  userDeviceSchema: many(userDeviceSchema),
  sysNotificationSchema: many(sysNotificationSchema),
  projectSchema: many(projectSchema),
}))

import { foreignKey, jsonb, pgTable, smallint, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { permissionAction, permissionSubject, userStatus } from './enum.schema'
import { categories } from './category.schema'
import { posts } from './post.schema'
import { projects } from './project.schema'
import { stripeSubscriptions } from './stripe.schema'
import { userDevices, userPaymentMethods, userShortcuts } from './user.schema'

export const sysFaqCategories = pgTable('sys_faq_categories', {
  id: smallint('id').primaryKey().generatedByDefaultAsIdentity({ name: 'sys_faq_categories_id_seq', startWith: 1, increment: 1, minValue: 1, maxValue: 32767, cache: 1 }),
  title: text('title'),
  icon: text('icon'),
  subtitle: text('subtitle'),
})

export const sysRoles = pgTable('sys_roles', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  name: text('name'),
})

export const sysPermissions = pgTable('sys_permissions', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  roleId: uuid('role_id'),
  action: permissionAction('action').default('read').notNull(),
  subject: permissionSubject('subject').notNull(),
}, (table) => {
  return {
    publicSysPermissionsRoleIdFkey: foreignKey({
      columns: [table.roleId],
      foreignColumns: [sysRoles.id],
      name: 'public_sys_permissions_role_id_fkey',
    }).onDelete('cascade'),
  }
})

export const sysUsers = pgTable('sys_users', {
  id: uuid('id').primaryKey().notNull(),
  email: text('email'),
  phone: text('phone'),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
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
      foreignColumns: [sysRoles.id],
      name: 'public_sys_users_role_id_fkey',
    }),
  }
})

export const sysFaqs = pgTable('sys_faqs', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  answer: text('answer'),
  categoryId: smallint('category_id'),
  question: text('question'),
}, (table) => {
  return {
    publicSysFaqsCategoryIdFkey: foreignKey({
      columns: [table.categoryId],
      foreignColumns: [sysFaqCategories.id],
      name: 'public_sys_faqs_category_id_fkey',
    }).onUpdate('cascade').onDelete('cascade'),
  }
})

export const sysShortcuts = pgTable('sys_shortcuts', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  item: text('item'),
  userId: uuid('user_id').notNull(),
}, (table) => {
  return {
    sysShortcutsUserIdFkey: foreignKey({
      columns: [table.userId],
      foreignColumns: [sysUsers.id],
      name: 'sys_shortcuts_user_id_fkey',
    }),
  }
})

export const sysNotifications = pgTable('sys_notifications', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  title: text('title'),
  message: text('message'),
  action: jsonb('action'),
  readAt: timestamp('read_at', { withTimezone: true, mode: 'string' }),
  userId: uuid('user_id').defaultRandom(),
}, (table) => {
  return {
    publicSysNotificationsUserIdFkey: foreignKey({
      columns: [table.userId],
      foreignColumns: [sysUsers.id],
      name: 'public_sys_notifications_user_id_fkey',
    }).onUpdate('cascade').onDelete('cascade'),
  }
})

export const sysRolesRelations = relations(sysRoles, ({ many }) => ({
  sysUsers: many(sysUsers),
  sysPermissions: many(sysPermissions),
}))

export const sysPermissionsRelations = relations(sysPermissions, ({ one }) => ({
  sysRole: one(sysRoles, {
    fields: [sysPermissions.roleId],
    references: [sysRoles.id],
  }),
}))

export const sysFaqsRelations = relations(sysFaqs, ({ one }) => ({
  sysFaqCategory: one(sysFaqCategories, {
    fields: [sysFaqs.categoryId],
    references: [sysFaqCategories.id],
  }),
}))

export const sysFaqCategoriesRelations = relations(sysFaqCategories, ({ many }) => ({
  sysFaqs: many(sysFaqs),
}))

export const sysShortcutsRelations = relations(sysShortcuts, ({ one }) => ({
  sysUser: one(sysUsers, {
    fields: [sysShortcuts.userId],
    references: [sysUsers.id],
  }),
}))

export const sysUsersRelations = relations(sysUsers, ({ one, many }) => ({
  sysShortcuts: many(sysShortcuts),
  stripeSubscriptions: many(stripeSubscriptions),
  sysRole: one(sysRoles, {
    fields: [sysUsers.roleId],
    references: [sysRoles.id],
  }),
  categories: many(categories),
  posts: many(posts),
  userShortcuts: many(userShortcuts),
  userPaymentMethods: many(userPaymentMethods),
  userDevices: many(userDevices),
  sysNotifications: many(sysNotifications),
  projects: many(projects),
}))

export const sysNotificationsRelations = relations(sysNotifications, ({ one }) => ({
  sysUser: one(sysUsers, {
    fields: [sysNotifications.userId],
    references: [sysUsers.id],
  }),
}))

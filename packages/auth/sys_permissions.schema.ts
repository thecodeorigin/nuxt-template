import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { permissionAction } from './enum.schema'
import { sysRoleTable } from './sys_roles.schema'

export const sysPermissionTable = pgTable('sys_permissions', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  role_id: uuid('role_id').references(() => sysRoleTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
  action: permissionAction('action').default('read').notNull(),
  subject: text('subject').notNull(),
})

export const sysPermissionRelations = relations(sysPermissionTable, ({ one }) => ({
  role: one(sysRoleTable, {
    fields: [sysPermissionTable.role_id],
    references: [sysRoleTable.id],
  }),
}))

import { foreignKey, pgTable, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { permissionAction, permissionSubject } from './enum.schema'
import { sysRoleTable } from './sys_roles.schema'

export const sysPermissionTable = pgTable('sys_permissions', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  role_id: uuid('role_id'),
  action: permissionAction('action').default('read').notNull(),
  subject: permissionSubject('subject').notNull(),
}, (table) => {
  return {
    publicSysPermissionsRoleIdFkey: foreignKey({
      columns: [table.role_id],
      foreignColumns: [sysRoleTable.id],
      name: 'public_sys_permissions_role_id_fkey',
    }).onDelete('cascade'),
  }
})

export const insertSysPermissionSchema = createInsertSchema(sysPermissionTable)

export const selectSysPermissionSchema = createSelectSchema(sysPermissionTable)

export const sysPermissionRelations = relations(sysPermissionTable, ({ one }) => ({
  sysRole: one(sysRoleTable, {
    fields: [sysPermissionTable.role_id],
    references: [sysRoleTable.id],
  }),
}))

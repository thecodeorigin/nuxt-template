import { foreignKey, pgTable, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { permissionAction, permissionSubject } from './enum.schema'
import { sysRoleTable } from './sys_roles.schema'

export const sysPermissionTable = pgTable('sys_permissions', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  role_id: uuid('role_id').references(() => sysRoleTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
  action: permissionAction('action').default('read').notNull(),
  subject: permissionSubject('subject').notNull(),
})

export const insertSysPermissionSchema = createInsertSchema(sysPermissionTable)

export const selectSysPermissionSchema = createSelectSchema(sysPermissionTable)

export const sysPermissionRelations = relations(sysPermissionTable, ({ one }) => ({
  role: one(sysRoleTable, {
    fields: [sysPermissionTable.role_id],
    references: [sysRoleTable.id],
  }),
}))

import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { sysOrganizationTable } from './sys_organizations.schema'
import { sysUserTable } from './sys_users.schema'

export const sysOrganizationUserTable = pgTable('sys_organization_user', {
  organization_id: uuid('organization_id').references(() => sysOrganizationTable.id, { onDelete: 'cascade' }).notNull(),
  user_id: uuid('user_id').references(() => sysUserTable.id, { onDelete: 'cascade' }).notNull(),
}, table => ({
  pk: primaryKey({ columns: [table.organization_id, table.user_id] }),
}))

export const sysOrganizationUserRelation = relations(sysOrganizationUserTable, ({ one }) => ({
  organization: one(sysOrganizationTable, {
    fields: [sysOrganizationUserTable.organization_id],
    references: [sysOrganizationTable.id],
  }),
  user: one(sysUserTable, {
    fields: [sysOrganizationUserTable.organization_id],
    references: [sysUserTable.id],
  }),
}))

import { foreignKey, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { categoryTable } from './category.schema'
import { sysUserTable } from './sys_users.schema'

export const projectTable = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  title: text('title'),
  description: text('description'),
  user_id: uuid('user_id').defaultRandom(),
  category_id: uuid('category_id').defaultRandom(),
}, (table) => {
  return {
    publicProjectsUserIdFkey: foreignKey({
      columns: [table.user_id],
      foreignColumns: [sysUserTable.id],
      name: 'public_projects_user_id_fkey',
    }).onUpdate('cascade').onDelete('cascade'),
    publicProjectsCategoryIdFkey: foreignKey({
      columns: [table.category_id],
      foreignColumns: [categoryTable.id],
      name: 'public_projects_category_id_fkey',
    }).onUpdate('cascade').onDelete('cascade'),
  }
})

export const insertProjectSchema = createInsertSchema(projectTable)

export const selectProjectSchema = createSelectSchema(projectTable)

export const projectRelations = relations(projectTable, ({ one }) => ({
  sysUser: one(sysUserTable, {
    fields: [projectTable.user_id],
    references: [sysUserTable.id],
  }),
  category: one(categoryTable, {
    fields: [projectTable.category_id],
    references: [categoryTable.id],
  }),
}))

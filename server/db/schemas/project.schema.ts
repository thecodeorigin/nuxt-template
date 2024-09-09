import { foreignKey, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { categoryTable } from './category.schema'
import { sysUserTable } from './sys_users.schema'

export const projectTable = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  title: text('title'),
  description: text('description'),
  userId: uuid('user_id').defaultRandom(),
  categoryId: uuid('category_id').defaultRandom(),
}, (table) => {
  return {
    publicProjectsUserIdFkey: foreignKey({
      columns: [table.userId],
      foreignColumns: [sysUserTable.id],
      name: 'public_projects_user_id_fkey',
    }).onUpdate('cascade').onDelete('cascade'),
    publicProjectsCategoryIdFkey: foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categoryTable.id],
      name: 'public_projects_category_id_fkey',
    }).onUpdate('cascade').onDelete('cascade'),
  }
})

export const insertProjectSchema = createInsertSchema(projectTable)

export const selectProjectSchema = createSelectSchema(projectTable)

export const projectRelations = relations(projectTable, ({ one }) => ({
  sysUser: one(sysUserTable, {
    fields: [projectTable.userId],
    references: [sysUserTable.id],
  }),
  category: one(categoryTable, {
    fields: [projectTable.categoryId],
    references: [categoryTable.id],
  }),
}))

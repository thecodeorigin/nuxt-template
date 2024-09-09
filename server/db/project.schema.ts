import { foreignKey, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { categorySchema } from './category.schema'
import { sysUserSchema } from './sys_users.schema'

export const projectSchema = pgTable('projects', {
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
      foreignColumns: [sysUserSchema.id],
      name: 'public_projects_user_id_fkey',
    }).onUpdate('cascade').onDelete('cascade'),
    publicProjectsCategoryIdFkey: foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categorySchema.id],
      name: 'public_projects_category_id_fkey',
    }).onUpdate('cascade').onDelete('cascade'),
  }
})

export const projectsRelations = relations(projectSchema, ({ one }) => ({
  sysUser: one(sysUserSchema, {
    fields: [projectSchema.userId],
    references: [sysUserSchema.id],
  }),
  category: one(categorySchema, {
    fields: [projectSchema.categoryId],
    references: [categorySchema.id],
  }),
}))

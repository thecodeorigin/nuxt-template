import { foreignKey, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { sysUsers } from './sys.schema'
import { categories } from './category.schema'

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  title: text('title'),
  description: text('description'),
  userId: uuid('user_id').defaultRandom(),
  categoryId: uuid('category_id').defaultRandom(),
}, (table) => {
  return {
    publicProjectsUserIdFkey: foreignKey({
      columns: [table.userId],
      foreignColumns: [sysUsers.id],
      name: 'public_projects_user_id_fkey',
    }).onUpdate('cascade').onDelete('cascade'),
    publicProjectsCategoryIdFkey: foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: 'public_projects_category_id_fkey',
    }).onUpdate('cascade').onDelete('cascade'),
  }
})

export const projectsRelations = relations(projects, ({ one }) => ({
  sysUser: one(sysUsers, {
    fields: [projects.userId],
    references: [sysUsers.id],
  }),
  category: one(categories, {
    fields: [projects.categoryId],
    references: [categories.id],
  }),
}))

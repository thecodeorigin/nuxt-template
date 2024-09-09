import { foreignKey, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { postTable } from './post.schema'
import { projectTable } from './project.schema'
import { sysUserTable } from './sys_users.schema'

export const categoryTable = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  name: text('name'),
  slug: text('slug').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
  imageUrl: text('image_url'),
  userId: uuid('user_id'),
  parentId: uuid('parent_id'),
}, (table) => {
  return {
    publicCategoriesUserIdFkey: foreignKey({
      columns: [table.userId],
      foreignColumns: [sysUserTable.id],
      name: 'public_categories_user_id_fkey',
    }),
    publicCategoriesParentIdFkey: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: 'public_categories_parent_id_fkey',
    }).onDelete('cascade'),
    categoriesSlugKey: unique('categories_slug_key').on(table.slug),
  }
})

export const insertCategorySchema = createInsertSchema(categoryTable)

export const selectCategorySchema = createSelectSchema(categoryTable)

export const categoryRelations = relations(categoryTable, ({ one, many }) => ({
  sysUser: one(sysUserTable, {
    fields: [categoryTable.userId],
    references: [sysUserTable.id],
  }),
  category: one(categoryTable, {
    fields: [categoryTable.parentId],
    references: [categoryTable.id],
    relationName: 'categories_parentId_categories_id',
  }),
  categorySchema: many(categoryTable, {
    relationName: 'categories_parentId_categories_id',
  }),
  postSchema: many(postTable),
  projectSchema: many(projectTable),
}))

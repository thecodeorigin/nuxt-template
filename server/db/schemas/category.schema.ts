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
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
  image_url: text('image_url'),
  user_id: uuid('user_id'),
  parent_id: uuid('parent_id'),
}, (table) => {
  return {
    publicCategoriesUserIdFkey: foreignKey({
      columns: [table.user_id],
      foreignColumns: [sysUserTable.id],
      name: 'public_categories_user_id_fkey',
    }),
    publicCategoriesParentIdFkey: foreignKey({
      columns: [table.parent_id],
      foreignColumns: [table.id],
      name: 'public_categories_parent_id_fkey',
    }).onDelete('cascade'),
    categoriesSlugKey: unique('categories_slug_key').on(table.slug),
  }
})

export const insertCategorySchema = createInsertSchema(categoryTable)

export const selectCategorySchema = createSelectSchema(categoryTable)

export const categoryRelations = relations(categoryTable, ({ one, many }) => ({
  owner: one(sysUserTable, {
    fields: [categoryTable.user_id],
    references: [sysUserTable.id],
  }),
  parent: one(categoryTable, {
    fields: [categoryTable.parent_id],
    references: [categoryTable.id],
    relationName: 'categories_parentId_categories_id',
  }),
  children: many(categoryTable, {
    relationName: 'categories_parentId_categories_id',
  }),
  posts: many(postTable),
  projects: many(projectTable),
}))

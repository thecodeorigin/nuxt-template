import { foreignKey, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { sysUsers } from './sys.schema'
import { posts } from './post.schema'
import { projects } from './project.schema'

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  name: text('name'),
  slug: text('slug').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  imageUrl: text('image_url'),
  userId: uuid('user_id'),
  parentId: uuid('parent_id'),
}, (table) => {
  return {
    publicCategoriesUserIdFkey: foreignKey({
      columns: [table.userId],
      foreignColumns: [sysUsers.id],
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

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  sysUser: one(sysUsers, {
    fields: [categories.userId],
    references: [sysUsers.id],
  }),
  category: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'categories_parentId_categories_id',
  }),
  categories: many(categories, {
    relationName: 'categories_parentId_categories_id',
  }),
  posts: many(posts),
  projects: many(projects),
}))

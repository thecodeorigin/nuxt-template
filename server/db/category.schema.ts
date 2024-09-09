import { foreignKey, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { postSchema } from './post.schema'
import { projectSchema } from './project.schema'
import { sysUserSchema } from './sys_users.schema'

export const categorySchema = pgTable('categories', {
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
      foreignColumns: [sysUserSchema.id],
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

export const categoriesRelations = relations(categorySchema, ({ one, many }) => ({
  sysUser: one(sysUserSchema, {
    fields: [categorySchema.userId],
    references: [sysUserSchema.id],
  }),
  category: one(categorySchema, {
    fields: [categorySchema.parentId],
    references: [categorySchema.id],
    relationName: 'categories_parentId_categories_id',
  }),
  categorySchema: many(categorySchema, {
    relationName: 'categories_parentId_categories_id',
  }),
  postSchema: many(postSchema),
  projectSchema: many(projectSchema),
}))

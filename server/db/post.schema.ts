import { foreignKey, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { categorySchema } from './category.schema'
import { sysUserSchema } from './sys_users.schema'

export const postSchema = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  title: text('title'),
  slug: text('slug').notNull(),
  description: text('description'),
  body: text('body'),
  categoryId: uuid('category_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
  userId: uuid('user_id').defaultRandom(),
}, (table) => {
  return {
    publicPostsCategoryIdFkey: foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categorySchema.id],
      name: 'public_posts_category_id_fkey',
    }),
    publicPostsUserIdFkey: foreignKey({
      columns: [table.userId],
      foreignColumns: [sysUserSchema.id],
      name: 'public_posts_user_id_fkey',
    }).onDelete('cascade'),
    postsSlugKey: unique('posts_slug_key').on(table.slug),
  }
})

export const postsRelations = relations(postSchema, ({ one }) => ({
  category: one(categorySchema, {
    fields: [postSchema.categoryId],
    references: [categorySchema.id],
  }),
  sysUser: one(sysUserSchema, {
    fields: [postSchema.userId],
    references: [sysUserSchema.id],
  }),
}))

import { foreignKey, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { categories } from './category.schema'
import { sysUsers } from './sys.schema'

export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  title: text('title'),
  slug: text('slug').notNull(),
  description: text('description'),
  body: text('body'),
  categoryId: uuid('category_id'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  userId: uuid('user_id').defaultRandom(),
}, (table) => {
  return {
    publicPostsCategoryIdFkey: foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: 'public_posts_category_id_fkey',
    }),
    publicPostsUserIdFkey: foreignKey({
      columns: [table.userId],
      foreignColumns: [sysUsers.id],
      name: 'public_posts_user_id_fkey',
    }).onDelete('cascade'),
    postsSlugKey: unique('posts_slug_key').on(table.slug),
  }
})

export const postsRelations = relations(posts, ({ one }) => ({
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  sysUser: one(sysUsers, {
    fields: [posts.userId],
    references: [sysUsers.id],
  }),
}))

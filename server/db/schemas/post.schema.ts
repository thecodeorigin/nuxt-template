import { foreignKey, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { categoryTable } from './category.schema'
import { sysUserTable } from './sys_users.schema'

export const postTable = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  title: text('title'),
  slug: text('slug').notNull(),
  description: text('description'),
  body: text('body'),
  category_id: uuid('category_id'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
  user_id: uuid('user_id').defaultRandom(),
}, (table) => {
  return {
    publicPostsCategoryIdFkey: foreignKey({
      columns: [table.category_id],
      foreignColumns: [categoryTable.id],
      name: 'public_posts_category_id_fkey',
    }),
    publicPostsUserIdFkey: foreignKey({
      columns: [table.user_id],
      foreignColumns: [sysUserTable.id],
      name: 'public_posts_user_id_fkey',
    }).onDelete('cascade'),
    postsSlugKey: unique('posts_slug_key').on(table.slug),
  }
})

export const insertPostSchema = createInsertSchema(postTable)

export const selectPostSchema = createSelectSchema(postTable)

export const postRelations = relations(postTable, ({ one }) => ({
  category: one(categoryTable, {
    fields: [postTable.category_id],
    references: [categoryTable.id],
  }),
  sysUser: one(sysUserTable, {
    fields: [postTable.user_id],
    references: [sysUserTable.id],
  }),
}))

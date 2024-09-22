import { boolean, foreignKey, jsonb, numeric, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { categoryTable } from './category.schema'
import { sysUserTable } from './sys_users.schema'

export const modelEnum = pgEnum('model', ['tiny', 'medium', 'large-v3'])
export const statusEnum = pgEnum('status', ['processing', 'succeeded'])
export const projectTable = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  title: text('title'),
  description: text('description'),
  user_id: uuid('user_id').defaultRandom(),
  category_id: uuid('category_id').defaultRandom(),
  is_voice_recognition: boolean('is_voice_recognition'),
  model: modelEnum('model'),
  source_downloadable: text('source_downloadable'),
  source_duration: numeric('source_duration'),
  source_thumbnail: text('source_thumbnail'),
  source_title: text('source_title'),
  source_url: text('source_url'),
  structure: jsonb('structure'),
  subtitle: jsonb('subtitle').array(),
  summarize: text('summarize'),
  translate_from: text('translate_from'),
  translate_to: text('translate_to'),
  status: statusEnum('status').default('processing'),

}, (table) => {
  return {
    publicProjectsUserIdFkey: foreignKey({
      columns: [table.user_id],
      foreignColumns: [sysUserTable.id],
      name: 'public_projects_user_id_fkey',
    }).onUpdate('cascade').onDelete('cascade'),
    publicProjectsCategoryIdFkey: foreignKey({
      columns: [table.category_id],
      foreignColumns: [categoryTable.id],
      name: 'public_projects_category_id_fkey',
    }).onUpdate('cascade').onDelete('cascade'),
  }
})

export const insertProjectSchema = createInsertSchema(projectTable)

export const selectProjectSchema = createSelectSchema(projectTable)

export const projectRelations = relations(projectTable, ({ one }) => ({
  owner: one(sysUserTable, {
    fields: [projectTable.user_id],
    references: [sysUserTable.id],
  }),
  category: one(categoryTable, {
    fields: [projectTable.category_id],
    references: [categoryTable.id],
  }),
}))

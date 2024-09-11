import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

export const sysLandingPageTable = pgTable('sys_landing_page', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  banner_button: text('banner_button').notNull(),
  banner_image: text('banner_image'),
  banner_title: text('banner_title').notNull(),
  banner_title_desc: text('banner_title_desc').notNull(),
  contact_us_card_content: text('contact_us_card_content').notNull(),
  contact_us_card_heading: text('contact_us_card_heading').notNull(),
  contact_us_card_image: text('contact_us_card_image'),
  contact_us_card_title: text('contact_us_card_title').notNull(),
  contact_us_title: text('contact_us_title').notNull(),
  contact_us_title_desc: text('contact_us_title_desc'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  customer_review_data: jsonb('customer_review_data'),
  customer_review_title: text('customer_review_title').notNull(),
  customer_review_title_desc: text('customer_review_title_desc'),
  faq_data: jsonb('faq_data'),
  faq_title: text('faq_title').notNull(),
  faq_title_desc: text('faq_title_desc').notNull(),
  feature_data: jsonb('feature_data'),
  feature_title: text('feature_title').notNull(),
  feature_title_desc: text('feature_title_desc'),
  hero_main_img_dark: text('hero_main_img_dark'),
  hero_main_img_light: text('hero_main_img_light'),
  hero_sub_img_dark: text('hero_sub_img_dark'),
  hero_sub_img_light: text('hero_sub_img_light'),
  hero_title: text('hero_title').notNull(),
  hero_title_button: jsonb('hero_title_button').notNull(),
  hero_title_desc: text('hero_title_desc').notNull(),
  our_team_data: jsonb('our_team_data'),
  our_team_desc: text('our_team_desc').notNull(),
  our_team_title: text('our_team_title').notNull(),
  pricing_data: jsonb('pricing_data'),
  pricing_title: text('pricing_title').notNull(),
  pricing_title_desc: text('pricing_title_desc').notNull(),
  product_stats: jsonb('product_stats'),
})

export const insertSysLandingPageSchema = createInsertSchema(sysLandingPageTable)
export const selectSysLandingPageSchema = createSelectSchema(sysLandingPageTable)

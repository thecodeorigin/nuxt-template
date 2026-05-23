import type { InferSelect } from '~~/server/db/types'
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { userTable } from '#layers/auth/server/db/schema'

export const userReferralTable = sqliteTable('user_referrals', {
  user_id: text('user_id').primaryKey().references(() => userTable.id, { onDelete: 'cascade' }),
  code: text('code').notNull().unique(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
export type UserReferral = InferSelect<typeof userReferralTable>

export const referralTable = sqliteTable('referrals', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  referrer_id: text('referrer_id').references(() => userTable.id, { onDelete: 'cascade' }).notNull(),
  referee_id: text('referee_id').references(() => userTable.id, { onDelete: 'cascade' }).notNull(),
  source: text('source', { enum: ['link', 'invite'] as const }).notNull().default('link'),
  reward_paid: integer('reward_paid', { mode: 'boolean' }).notNull().default(false),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, table => [
  uniqueIndex('referrals_referee_unique').on(table.referee_id),
  index('referrals_referrer_idx').on(table.referrer_id),
])
export type Referral = InferSelect<typeof referralTable>

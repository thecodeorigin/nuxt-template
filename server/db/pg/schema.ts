import type { Endpoints } from '@octokit/types'
import type { InferInsertModel, InferSelectModel, Table } from 'drizzle-orm'
import type { TokenPayload } from 'google-auth-library'
import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

// --- Utility Types ---

type NullableKeys<T> = {
  [K in keyof T]: null extends T[K] ? K : never;
}[keyof T]

export type InferSelect<T extends Table>
  = InferSelectModel<T> extends infer S
    ? Omit<S, NullableKeys<S>> & Partial<Pick<S, NullableKeys<S>>>
    : never

export type InferInsert<T extends Table>
  = InferInsertModel<T> extends infer S
    ? Omit<S, NullableKeys<S>> & Partial<Pick<S, NullableKeys<S>>>
    : never

export type GoogleUser = TokenPayload
export type GitHubUser = Endpoints['GET /user']['response']['data']

// --- Enums ---

enum AuthProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
}

function enumToPgEnum(myEnum: any): [string, ...string[]] {
  return Object.values(myEnum).map((value: any) => `${value}`) as [string, ...string[]]
}

export const providerEnum = pgEnum('auth_provider', enumToPgEnum(AuthProvider))

export enum ActivityAction {
  SIGN_IN = 'auth:sign_in',
  SIGN_UP = 'auth:sign_up',
}

export const activityActionEnum = pgEnum('activity_action', ActivityAction)

// --- Tables ---

export const userTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),

  // User profile data
  username: varchar('username', { length: 64 }),
  name: varchar('name', { length: 255 }),
  primary_email: varchar('primary_email', { length: 255 }).unique().notNull(),
  primary_phone: varchar('primary_phone', { length: 32 }).unique(),
  avatar: varchar('avatar', { length: 2048 }),

  // Settings
  verified: boolean('verified').default(false),
  email_notifications: boolean('email_notifications').default(true),

  // Metadata
  custom_data: jsonb('custom_data').default({}),
  last_sign_in_at: timestamp('last_sign_in_at', { withTimezone: true }),
  is_suspended: boolean('is_suspended').default(false),

  // Timestamps
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, table => [
  index('users_username_idx').on(table.username),
  index('users_name_idx').on(table.name),
])

export type User = InferSelect<typeof userTable>

export const identityTable = pgTable('identities', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  user_id: uuid('user_id')
    .references(() => userTable.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  provider: providerEnum('provider').notNull(),
  provider_user_id: varchar('provider_user_id', { length: 255 }).notNull(),
  provider_data: jsonb('provider_data').$type<GoogleUser | GitHubUser>(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, table => [
  index('identities_user_id_idx').on(table.user_id),
  uniqueIndex('identities_provider_unique_idx').on(table.provider, table.provider_user_id),
])

export type Identity = InferSelect<typeof identityTable>

export const activityTable = pgTable('activities', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  user_id: uuid('user_id')
    .references(() => userTable.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  action: activityActionEnum('action').notNull(),
  action_ref_id: uuid('action_ref_id'),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, table => [
  index('activities_user_id_idx').on(table.user_id),
])

// --- Relations ---

export const userRelations = relations(userTable, ({ many }) => ({
  identities: many(identityTable),
  activities: many(activityTable),
}))

export const identityRelations = relations(identityTable, ({ one }) => ({
  user: one(userTable, {
    fields: [identityTable.user_id],
    references: [userTable.id],
  }),
}))

export const activityRelations = relations(activityTable, ({ one }) => ({
  user: one(userTable, {
    fields: [activityTable.user_id],
    references: [userTable.id],
  }),
}))

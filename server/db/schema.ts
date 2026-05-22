import type { Endpoints } from '@octokit/types'
import type { InferInsertModel, InferSelectModel, Table } from 'drizzle-orm'
import type { TokenPayload } from 'google-auth-library'
import { relations } from 'drizzle-orm'
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

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
// D1/SQLite has no native enum type; values are constrained at the Drizzle
// layer via `text({ enum })` and surfaced as runtime TS enums for handlers.

export enum AuthProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
}

export enum ActivityAction {
  SIGN_IN = 'auth:sign_in',
  SIGN_UP = 'auth:sign_up',
  IMPERSONATE_START = 'auth:impersonate_start',
  IMPERSONATE_STOP = 'auth:impersonate_stop',
}

function enumValues<T extends Record<string, string>>(myEnum: T): [string, ...string[]] {
  return Object.values(myEnum) as [string, ...string[]]
}

// --- Tables ---

export const userTable = sqliteTable('users', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),

  // User profile data
  username: text('username'),
  name: text('name'),
  primary_email: text('primary_email').unique().notNull(),
  primary_phone: text('primary_phone').unique(),
  avatar: text('avatar'),

  // Settings
  verified: integer('verified', { mode: 'boolean' }).default(false),
  email_notifications: integer('email_notifications', { mode: 'boolean' }).default(true),

  // Metadata
  custom_data: text('custom_data', { mode: 'json' }).$type<Record<string, unknown>>().default({}),
  last_sign_in_at: integer('last_sign_in_at', { mode: 'timestamp' }),
  is_suspended: integer('is_suspended', { mode: 'boolean' }).default(false),

  // Timestamps
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  index('users_username_idx').on(table.username),
  index('users_name_idx').on(table.name),
])

export type User = InferSelect<typeof userTable>

export const identityTable = sqliteTable('identities', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id')
    .references(() => userTable.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  provider: text('provider', { enum: enumValues(AuthProvider) }).notNull(),
  provider_user_id: text('provider_user_id').notNull(),
  provider_data: text('provider_data', { mode: 'json' }).$type<GoogleUser | GitHubUser>(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  index('identities_user_id_idx').on(table.user_id),
  uniqueIndex('identities_provider_unique_idx').on(table.provider, table.provider_user_id),
])

export type Identity = InferSelect<typeof identityTable>

export const activityTable = sqliteTable('activities', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id')
    .references(() => userTable.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  action: text('action', { enum: enumValues(ActivityAction) }).notNull(),
  action_ref_id: text('action_ref_id'),
  test: text('test', { mode: 'json' }),
  metadata: text('metadata', { mode: 'json' }),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
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

// --- Organizations (the only tenancy + authorization boundary) ---

export const organizationTable = sqliteTable('organizations', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  owner_id: text('owner_id').references(() => userTable.id, { onDelete: 'set null' }),
  is_personal: integer('is_personal', { mode: 'boolean' }).notNull().default(false),
  is_system: integer('is_system', { mode: 'boolean' }).notNull().default(false),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  index('organizations_is_system_idx').on(table.is_system),
])

export type Organization = InferSelect<typeof organizationTable>

export const organizationMemberTable = sqliteTable('organization_members', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').references(() => userTable.id, { onDelete: 'cascade' }).notNull(),
  organization_id: text('organization_id').references(() => organizationTable.id, { onDelete: 'cascade' }).notNull(),
  abilities: text('abilities', { mode: 'json' }).$type<string[]>().notNull().default([]),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  uniqueIndex('org_members_user_org_unique').on(table.user_id, table.organization_id),
  index('org_members_org_idx').on(table.organization_id),
])

export type OrganizationMember = InferSelect<typeof organizationMemberTable>

// --- Permissions (catalog — read-model for the membership editor) ---

export const permissionTable = sqliteTable('permissions', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  key: text('key').notNull().unique(),
  subject: text('subject').notNull(),
  action: text('action').notNull(),
  scope: text('scope'),
  org_kind: text('org_kind', { enum: ['system', 'tenant'] }).notNull(),
  description: text('description'),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, table => [
  index('permissions_subject_idx').on(table.subject),
])

export type Permission = InferSelect<typeof permissionTable>

// --- Todos (org-scoped CRUD resource) ---

export const todoTable = sqliteTable('todos', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  organization_id: text('organization_id').references(() => organizationTable.id, { onDelete: 'cascade' }).notNull(),
  user_id: text('user_id').references(() => userTable.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  index('todos_org_idx').on(table.organization_id),
])

export type TodoRow = InferSelect<typeof todoTable>

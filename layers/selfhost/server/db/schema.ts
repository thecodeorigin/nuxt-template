import type { InferSelect } from '~~/server/db/types'
import { organizationTable, userTable } from '@nuxthub/db/schema'
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const selfhostDeploymentTable = sqliteTable('selfhost_deployments', {
  organization_id: text('organization_id').primaryKey().references(() => organizationTable.id, { onDelete: 'cascade' }),
  cf_account_id: text('cf_account_id'),
  cf_script_name: text('cf_script_name'),
  workers_dev_url: text('workers_dev_url'),
  deployed_version: text('deployed_version'),
  deployed_at: integer('deployed_at', { mode: 'timestamp' }),
  // CF API token, AES-GCM encrypted via authSecret. Never log, never return.
  cf_token_ciphertext: text('cf_token_ciphertext'),
  cf_token_iv: text('cf_token_iv'),
  // Surfaces to UI for "token expires in N days" warning. From /user/tokens/verify.
  cf_token_expires_at: integer('cf_token_expires_at', { mode: 'timestamp' }),
  status: text('status', { enum: ['idle', 'deploying', 'deployed', 'failed'] }).notNull().default('idle'),
  last_error: text('last_error'),
})
export type SelfhostDeployment = InferSelect<typeof selfhostDeploymentTable>

export const selfhostAuditTable = sqliteTable('selfhost_audit', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  organization_id: text('organization_id').references(() => organizationTable.id, { onDelete: 'cascade' }).notNull(),
  actor_user_id: text('actor_user_id').references(() => userTable.id, { onDelete: 'set null' }),
  action: text('action', { enum: ['deploy', 'redeploy', 'disconnect', 'secret_reveal', 'secret_update'] }).notNull(),
  success: integer('success', { mode: 'boolean' }).notNull(),
  cf_account_id: text('cf_account_id'),
  error_message: text('error_message'),
  started_at: integer('started_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  finished_at: integer('finished_at', { mode: 'timestamp' }),
}, table => [
  index('selfhost_audit_org_idx').on(table.organization_id),
  index('selfhost_audit_started_idx').on(table.started_at),
])
export type SelfhostAudit = InferSelect<typeof selfhostAuditTable>

export const selfhostDeploymentSecretTable = sqliteTable('selfhost_deployment_secrets', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  organization_id: text('organization_id').references(() => organizationTable.id, { onDelete: 'cascade' }).notNull(),
  key: text('key').notNull(),
  ciphertext: text('ciphertext').notNull(),
  iv: text('iv').notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  uniqueIndex('selfhost_secrets_org_key_unique').on(table.organization_id, table.key),
])
export type SelfhostDeploymentSecret = InferSelect<typeof selfhostDeploymentSecretTable>

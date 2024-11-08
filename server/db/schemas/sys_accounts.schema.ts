import { integer, pgTable, primaryKey, text, uuid } from 'drizzle-orm/pg-core'
import type { AdapterAccountType } from '@auth/core/adapters'
import { sysUserTable } from './sys_users.schema'

export const sysAccountTable = pgTable(
  'sys_accounts',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => sysUserTable.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    provider_account_id: text('provider_account_id').notNull().unique(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
)

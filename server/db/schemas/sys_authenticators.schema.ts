import { boolean, integer, pgTable, primaryKey, text, uuid } from 'drizzle-orm/pg-core'
import { sysUserTable } from './sys_users.schema'

export const sysAuthenticatorTable = pgTable(
  'authenticator',
  {
    credential_id: text('credential_id').notNull().unique(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => sysUserTable.id, { onDelete: 'cascade' }),
    provider_account_id: text('provider_account_id').notNull(),
    credential_public_key: text('credential_public_key').notNull(),
    counter: integer('counter').notNull(),
    credential_device_type: text('credential_device_type').notNull(),
    credential_backed_up: boolean('credential_backed_up').notNull(),
    transports: text('transports'),
  },
  authenticator => ({
    compositePK: primaryKey({
      columns: [authenticator.user_id, authenticator.credential_id],
    }),
  }),
)

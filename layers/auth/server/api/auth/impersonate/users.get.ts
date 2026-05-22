import { userTable } from '@nuxthub/db/schema'
import { ne } from 'drizzle-orm'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { IMPERSONATE_ABILITY } from '#layers/auth/server/services/impersonate'

export default defineAuthorizedHandler(
  [IMPERSONATE_ABILITY],
  async (_event, { session }) => {
    const rows = await db
      .select({
        id: userTable.id,
        username: userTable.username,
        name: userTable.name,
        primary_email: userTable.primary_email,
        avatar: userTable.avatar,
        is_suspended: userTable.is_suspended,
      })
      .from(userTable)
      .where(ne(userTable.id, session.id))

    return rows
  },
)

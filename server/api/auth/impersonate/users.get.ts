import { ne } from 'drizzle-orm'
import { userTable } from '~~/server/db/pg/schema'
import { defineAuthorizedHandler } from '~~/server/services/casl'
import { IMPERSONATE_ABILITY } from '~~/server/services/impersonate'
import { getPgClient } from '~~/server/utils/pg'

export default defineAuthorizedHandler(
  [IMPERSONATE_ABILITY],
  async (_event, { session }) => {
    const db = getPgClient()
    const rows = await db
      .select({
        id: userTable.id,
        username: userTable.username,
        name: userTable.name,
        primary_email: userTable.primary_email,
        avatar: userTable.avatar,
        abilities: userTable.abilities,
        is_suspended: userTable.is_suspended,
      })
      .from(userTable)
      .where(ne(userTable.id, session.id))

    return rows
  },
)

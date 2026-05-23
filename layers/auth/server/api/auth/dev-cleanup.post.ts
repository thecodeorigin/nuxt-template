import { db } from '@nuxthub/db'
import { organizationTable, userTable } from '@nuxthub/db/schema'
import { kv } from '@nuxthub/kv'
import { and, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { backupKey, sessionKey } from '#layers/auth/server/services/impersonate'

const DevCleanupSchema = z.object({
  emails: z.array(z.email()).default([]),
  session_ids: z.array(z.string().min(1)).default([]),
})

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const { emails, session_ids } = await readValidatedBody(event, DevCleanupSchema.parse)

  let deletedUsers = 0
  let deletedOrgs = 0

  if (emails.length > 0) {
    const users = await db.query.userTable.findMany({
      where: inArray(userTable.primary_email, emails),
      columns: { id: true },
    })

    if (users.length > 0) {
      const userIds = users.map(u => u.id)
      // organizationTable.owner_id uses onDelete: 'set null', so personal orgs
      // must be removed explicitly before the user is deleted — they won't cascade.
      const removedOrgs = await db
        .delete(organizationTable)
        .where(and(
          inArray(organizationTable.owner_id, userIds),
          eq(organizationTable.is_personal, true),
        ))
        .returning()
      deletedOrgs = removedOrgs.length
    }

    const removed = await db
      .delete(userTable)
      .where(inArray(userTable.primary_email, emails))
      .returning()
    deletedUsers = removed.length
  }

  let deletedSessions = 0
  if (session_ids.length > 0) {
    for (const sid of session_ids) {
      await kv.del(sessionKey(sid))
      await kv.del(backupKey(sid))
      deletedSessions++
    }
  }

  return { deleted_users: deletedUsers, deleted_orgs: deletedOrgs, deleted_sessions: deletedSessions }
})

import { backupKey, sessionKey } from '#layers/auth/server/services/impersonate'
import { inArray } from 'drizzle-orm'
import { z } from 'zod'
import { userTable } from '~~/server/db/pg/schema'
import { getPgClient } from '~~/server/utils/pg'

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
  if (emails.length > 0) {
    const db = getPgClient()
    const removed = await db
      .delete(userTable)
      .where(inArray(userTable.primary_email, emails))
      .returning()
    deletedUsers = removed.length
  }

  let deletedSessions = 0
  if (session_ids.length > 0) {
    const storage = useStorage('redis')
    for (const sid of session_ids) {
      await storage.removeItem(sessionKey(sid))
      await storage.removeItem(backupKey(sid))
      deletedSessions++
    }
  }

  return { deleted_users: deletedUsers, deleted_sessions: deletedSessions }
})

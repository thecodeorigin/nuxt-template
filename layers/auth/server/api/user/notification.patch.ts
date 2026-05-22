import { db } from '@nuxthub/db'
import { userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { readValidatedBody } from 'h3'
import { defineAuthenticatedHandler } from '#layers/auth/server/services/auth'
import { NotificationPrefsSchema } from '#layers/auth/shared/schemas/user'

export default defineAuthenticatedHandler(async (event, session) => {
  const prefs = await readValidatedBody(event, NotificationPrefsSchema.parse)
  await db.update(userTable).set({ notification_prefs: prefs }).where(eq(userTable.id, session.id))
  return prefs
})

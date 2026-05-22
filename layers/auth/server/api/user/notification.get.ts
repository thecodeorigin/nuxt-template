import { db } from '@nuxthub/db'
import { userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { defineAuthenticatedHandler } from '#layers/auth/server/services/auth'

const DEFAULTS = { email: true, product_updates: true, weekly_digest: false, important_updates: true }

export default defineAuthenticatedHandler(async (_event, session) => {
  const [row] = await db
    .select({ prefs: userTable.notification_prefs })
    .from(userTable)
    .where(eq(userTable.id, session.id))
    .limit(1)
  return { ...DEFAULTS, ...(row?.prefs ?? {}) }
})

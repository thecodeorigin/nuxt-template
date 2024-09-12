import { and, eq } from 'drizzle-orm'
import { userShortcutTable } from '~/server/db/schemas/user_shortcuts.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session, uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

    const userShortcut = await db.select().from(userShortcutTable)
      .where(
        and(
          eq(userShortcutTable.user_id, session.user!.id!),
          eq(userShortcutTable.id, uuid),
        ),
      )
      .limit(1)

    setResponseStatus(event, 201)

    return { data: userShortcut[0] }
  }
  catch (error: any) {
    setResponseStatus(event, 404, error.message)
  }
})

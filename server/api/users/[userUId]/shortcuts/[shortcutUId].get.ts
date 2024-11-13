import { and, eq } from 'drizzle-orm'
import { userShortcutTable } from '@base/server/db/schemas'

export default defineEventHandler(async (event) => {
  try {
    const { userUId, shortcutUId } = await defineEventOptions(event, { auth: true, params: ['userUId', 'shortcutUId'] })

    const userShortcut = await db.select().from(userShortcutTable)
      .where(
        and(
          eq(userShortcutTable.user_id, userUId),
          eq(userShortcutTable.id, shortcutUId),
        ),
      )
      .limit(1)

    setResponseStatus(event, 201)

    return { data: userShortcut[0] }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

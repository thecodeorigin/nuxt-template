import { and, eq } from 'drizzle-orm'
import { userShortcutTable } from '@base/server/db/schemas/user_shortcuts.schema'

export default defineEventHandler(async (event) => {
  try {
    const { userId, shortcutId } = await defineEventOptions(event, { auth: true, params: ['userId', 'shortcutId'] })

    const userShortcut = await db.delete(userShortcutTable)
      .where(
        and(
          eq(userShortcutTable.user_id, userId),
          eq(userShortcutTable.id, shortcutId),
        ),
      )
      .returning()

    setResponseStatus(event, 201)

    return { data: userShortcut[0] }
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})

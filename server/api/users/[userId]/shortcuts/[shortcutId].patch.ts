import { eq } from 'drizzle-orm'
import { userShortcutTable } from '@base/server/db/schemas/user_shortcuts.schema'

export default defineEventHandler(async (event) => {
  try {
    const { userId, shortcutId } = await defineEventOptions(event, { auth: true, params: ['userId', 'shortcutId'] })

    const body = await readBody(event)

    const userShortcut = await db.update(userShortcutTable)
      .set({ ...body, user_id: userId })
      .where(eq(userShortcutTable.id, shortcutId))
      .returning()

    setResponseStatus(event, 201)

    return { data: userShortcut }
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})

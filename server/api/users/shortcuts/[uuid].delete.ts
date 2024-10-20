import { and, eq } from 'drizzle-orm'
import { userShortcutTable } from '@base/server/db/schemas/user_shortcuts.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session, uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

    const userShortcut = await db.delete(userShortcutTable)
      .where(
        and(
          eq(userShortcutTable.user_id, session.user!.id!),
          eq(userShortcutTable.id, uuid),
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

import { count, eq } from 'drizzle-orm'
import { userShortcutTable } from '~/server/db/schemas/user_shortcuts.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const userShortcutSubquery = db.select().from(userShortcutTable)
      .where(
        eq(userShortcutTable.user_id, session.user!.id!),
      )

    const total = await db.select({ count: count() }).from(userShortcutSubquery.as('count'))

    return {
      total,
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})

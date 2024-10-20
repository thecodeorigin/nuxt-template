import { count, eq } from 'drizzle-orm'
import { userShortcutTable } from '@base/server/db/schemas/user_shortcuts.schema'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await defineEventOptions(event, { auth: true, params: ['userId'] })

    const userShortcutSubquery = db.select().from(userShortcutTable)
      .where(
        eq(userShortcutTable.user_id, userId),
      )

    const total = await db.select({ count: count() }).from(userShortcutSubquery.as('count'))

    return {
      total,
    }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

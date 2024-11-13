import { count, eq } from 'drizzle-orm'
import { userShortcutTable } from '@base/server/db/schemas'

export default defineEventHandler(async (event) => {
  try {
    const { userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })

    const userShortcutSubquery = db.select().from(userShortcutTable)
      .where(
        eq(userShortcutTable.user_id, userUId),
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

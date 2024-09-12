import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm'
import { userShortcutTable } from '~/server/db/schemas/user_shortcuts.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { keyword = '', keywordLower = '', sortBy = 'created_at', sortAsc = true, limit = 10, page = 1 } = getFilter(event)

    const userShortcutSubquery = db.select().from(userShortcutTable)
      .where(
        and(
          ...[
            eq(userShortcutTable.user_id, session.user!.id!),
            userShortcutTable.route && or(
              ...[
                userShortcutTable.route && ilike(userShortcutTable.route, `%${keyword || ''}%`),
                userShortcutTable.route && ilike(userShortcutTable.route, `%${keywordLower || ''}%`),
              ].filter(Boolean),
            ),
          ].filter(Boolean),
        ),
      )

    const total = await db.select({ count: count() }).from(userShortcutSubquery.as('count'))

    const userShortcuts = await userShortcutSubquery
      .orderBy(
        sortAsc ? asc((userShortcutTable as any)[sortBy]) : desc((userShortcutTable as any)[sortBy]),
      )
      .offset((page - 1) * limit)
      .limit(limit)

    return {
      data: userShortcuts,
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

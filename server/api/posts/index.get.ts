import { and, asc, count, desc, eq, ilike, isNull, or, sql } from 'drizzle-orm'
import { postTable } from '@/server/db/schemas/post.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { keyword = '', keywordLower = '', sortBy = 'created_at', sortAsc = true, limit = 10, page = 1 } = getFilter(event)

    const postSubquery = db.select().from(postTable)
      .where(
        and(
          ...[
            eq(postTable.user_id, session.user!.id!),
            (postTable.title || postTable.description) && or(
              ...[
                postTable.title && ilike(postTable.title, `%${keyword || ''}%`),
                postTable.title && ilike(postTable.title, `%${keywordLower || ''}%`),
                postTable.description && ilike(postTable.description, `%${keyword || ''}%`),
                postTable.description && ilike(postTable.description, `%${keywordLower || ''}%`),
              ].filter(Boolean),
            ),
          ].filter(Boolean),
        ),
      )

    const total = await db.select({ count: count() }).from(postSubquery.as('count'))

    const posts = await postSubquery
      .orderBy(
        sortAsc ? asc((postTable as any)[sortBy]) : desc((postTable as any)[sortBy]),
      )
      .offset((page - 1) * limit)
      .limit(limit)

    return {
      data: posts,
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

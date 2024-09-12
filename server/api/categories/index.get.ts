import { and, asc, count, desc, eq, ilike, isNull, or, sql } from 'drizzle-orm'
import { categoryTable } from '@/server/db/schemas/category.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { keyword = '', keywordLower = '', sortBy = 'created_at', sortAsc = true, limit = 10, page = 1, parent_id } = getFilter(event)

    const categorySubquery = db.select().from(categoryTable)
      .where(
        and(
          eq(categoryTable.user_id, session.user!.id!),
          parent_id
            ? eq(categoryTable.parent_id, parent_id)
            : isNull(categoryTable.parent_id),
          or(
            ilike(categoryTable.name, `%${keyword || ''}%`),
            ...[
              categoryTable.name && ilike(categoryTable.name, `%${keywordLower || ''}%`),
              categoryTable.description && ilike(categoryTable.description, `%${keyword || ''}%`),
              categoryTable.description && ilike(categoryTable.description, `%${keywordLower || ''}%`),
            ].filter(Boolean),
          ),
        ),
      )

    const total = await db.select({ count: count() }).from(categorySubquery.as('count'))

    const categories = await categorySubquery
      .orderBy(
        sortAsc ? asc((categoryTable as any)[sortBy]) : desc((categoryTable as any)[sortBy]),
      )
      .offset((page - 1) * limit)
      .limit(limit)

    return {
      data: categories,
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

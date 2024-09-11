import { and, asc, count, desc, eq, ilike, isNull, or, sql } from 'drizzle-orm'
import { categoryTable } from '@/server/db/schemas/category.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { keyword = '', keywordLower = '', sortBy = 'created_at', sortAsc = true, limit = 10, page = 1, parent_id } = getFilter(event)

    const categorySubquery = db.select().from(categoryTable)

    if (parent_id) {
      categorySubquery
        .where(
          and(
            eq(categoryTable.user_id, session.user!.id!),
            eq(categoryTable.parent_id, parent_id),
          ),
        )
    }
    else {
      categorySubquery
        .where(
          and(
            eq(categoryTable.user_id, session.user!.id!),
            isNull(categoryTable.parent_id),
          ),
        )
    }

    categorySubquery
      .where(
        or(
          ilike(categoryTable.name, `%${keyword || ''}%`),
          ilike(categoryTable.name, `%${keywordLower || ''}%`),
          ilike(categoryTable.description, `%${keyword || ''}%`),
          ilike(categoryTable.description, `%${keywordLower || ''}%`),
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

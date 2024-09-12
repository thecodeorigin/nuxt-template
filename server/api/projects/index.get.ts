import { and, asc, count, desc, eq, ilike, isNull, or, sql } from 'drizzle-orm'
import { projectTable } from '@/server/db/schemas/project.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { keyword = '', keywordLower = '', sortBy = 'created_at', sortAsc = true, limit = 10, page = 1 } = getFilter(event)

    const projectSubquery = db.select().from(projectTable)
      .where(
        and(
          ...[
            eq(projectTable.user_id, session.user!.id!),
            projectTable.title && projectTable.description && or(
              ilike(projectTable.title, `%${keyword || ''}%`),
              ...[
                projectTable.title && ilike(projectTable.title, `%${keywordLower || ''}%`),
                projectTable.description && ilike(projectTable.description, `%${keyword || ''}%`),
                projectTable.description && ilike(projectTable.description, `%${keywordLower || ''}%`),
              ].filter(Boolean),
            ),
          ].filter(Boolean),
        ),
      )

    const total = await db.select({ count: count() }).from(projectSubquery.as('count'))

    const projects = await projectSubquery
      .orderBy(
        sortAsc ? asc((projectTable as any)[sortBy]) : desc((projectTable as any)[sortBy]),
      )
      .offset((page - 1) * limit)
      .limit(limit)

    return {
      data: projects,
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

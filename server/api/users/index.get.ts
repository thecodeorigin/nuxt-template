import { and, asc, count, desc, ilike, or } from 'drizzle-orm'
import { sysUserTable } from '~/server/db/schemas/sys_users.schema'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const { keyword = '', keywordLower = '', sortBy = 'created_at', sortAsc = true, limit = 10, page = 1 } = getFilter(event)

    const sysUserSubquery = db.select().from(sysUserTable)
      .where(
        and(
          ...[
            (sysUserTable.full_name || sysUserTable.email) && or(
              ...[
                sysUserTable.full_name && ilike(sysUserTable.full_name, `%${keyword || ''}%`),
                sysUserTable.full_name && ilike(sysUserTable.full_name, `%${keywordLower || ''}%`),
                sysUserTable.email && ilike(sysUserTable.email, `%${keyword || ''}%`),
                sysUserTable.email && ilike(sysUserTable.email, `%${keywordLower || ''}%`),
              ].filter(Boolean),
            ),
          ].filter(Boolean),
        ),
      )

    const total = await db.select({ count: count() }).from(sysUserSubquery.as('count'))

    const sysUsers = await sysUserSubquery
      .orderBy(
        sortAsc ? asc((sysUserTable as any)[sortBy]) : desc((sysUserTable as any)[sortBy]),
      )
      .offset((page - 1) * limit)
      .limit(limit)

    return {
      data: sysUsers,
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

import { and, asc, count, desc, eq, ilike, isNull, or, sql } from 'drizzle-orm'
import { sysRoleTable } from '~/server/db/schemas/sys_roles.schema'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const { keyword = '', keywordLower = '', sortBy = 'created_at', sortAsc = true, limit = 10, page = 1 } = getFilter(event)

    const sysRoleSubquery = db.select().from(sysRoleTable)
      .where(
        and(
          ...[
            sysRoleTable.name && or(
              ilike(sysRoleTable.name, `%${keyword || ''}%`),
              ilike(sysRoleTable.name, `%${keywordLower || ''}%`),
            ),
          ].filter(Boolean),
        ),
      )

    const total = await db.select({ count: count() }).from(sysRoleSubquery.as('count'))

    const sysRoles = await sysRoleSubquery
      .orderBy(
        sortAsc ? asc((sysRoleTable as any)[sortBy]) : desc((sysRoleTable as any)[sortBy]),
      )
      .offset((page - 1) * limit)
      .limit(limit)

    return {
      data: sysRoles,
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

import type { ParsedFilterQuery } from '@base/server/utils/filter'
import { sysPermissionTable } from '@base/server/db/schemas/sys_permissions.schema'
import { count, eq, or, sql } from 'drizzle-orm'

export function usePermission() {
  async function getPermissionCount(options?: ParsedFilterQuery) {
    const data = await db.select({ total: count() }).from(sysPermissionTable).where(
      options?.keyword
        ? or(
          sql<string>`cast(${sysPermissionTable.action} as text) like '%' || ${options.keyword} || '%'`,
          sql<string>`cast(${sysPermissionTable.subject} as text) like '%' || ${options.keyword} || '%'`,
          sql<string>`cast(${sysPermissionTable.action} as text) like '%' || ${options.keywordLower} || '%'`,
          sql<string>`cast(${sysPermissionTable.subject} as text) like '%' || ${options.keywordLower} || '%'`,
        )
        : undefined,
    )

    return data[0]
  }

  async function getPermissions(options: ParsedFilterQuery) {
    const sysPermissions = await db.query.sysPermissionTable.findMany({
      limit: options.limit,
      offset: options.limit * (options.page - 1),
      orderBy(schema, { asc, desc }) {
        return options.sortAsc
          ? asc((schema as any)[options.sortBy])
          : desc((schema as any)[options.sortBy])
      },
      where(schema, { or }) {
        if (options?.keyword) {
          return or(
            sql<string>`cast(${schema.action} as text) like '%' || ${options.keyword} || '%'`,
            sql<string>`cast(${schema.subject} as text) like '%' || ${options.keyword} || '%'`,
            sql<string>`cast(${schema.action} as text) like '%' || ${options.keywordLower} || '%'`,
            sql<string>`cast(${schema.subject} as text) like '%' || ${options.keywordLower} || '%'`,
          )
        }
      },
    })

    const { total } = options.withCount
      ? await getPermissionCount(options)
      : { total: sysPermissions.length }

    return {
      data: sysPermissions,
      total,
    }
  }

  async function getPermissionById(id: string) {
    const data = await db.query.sysPermissionTable.findFirst({
      where: sysPermissionTable => eq(sysPermissionTable.id, id),
    })

    return { data }
  }

  async function createPermission(body: any) {
    await db.insert(sysPermissionTable).values(body)
  }

  async function updatePermissionById(id: string, body: any) {
    await db.update(sysPermissionTable).set(body).where(eq(sysPermissionTable.id, id))
  }

  async function deletePermissionById(id: string) {
    await db.delete(sysPermissionTable).where(eq(sysPermissionTable.id, id))
  }

  return {
    getPermissions,
    getPermissionById,
    createPermission,
    updatePermissionById,
    deletePermissionById,
    getPermissionCount,
  }
}

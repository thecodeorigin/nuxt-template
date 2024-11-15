import type { ParsedFilterQuery } from '@base/server/utils/filter'
import { sysPermissionTable } from '@base/server/db/schemas/sys_permissions.schema'
import { and, eq, sql } from 'drizzle-orm'
import { sysRolePermissionTable } from '../db/schemas'
import { useCrud } from './useCrud'

export function usePermissionCrud() {
  const {
    getRecordByKey,
    createRecord,
    updateRecordByKey,
    deleteRecordByKey,
    countRecords,
  } = useCrud(sysPermissionTable, {
    searchBy: ['action'],
  })

  async function getPermissionsPaginated(options: ParsedFilterQuery) {
    const sysPermissions = await db.query.sysPermissionTable.findMany({
      with: {
        rolePermission: {
          with: {
            role: {
              columns: {
                name: true,
              },
            },
          },
        },
      },
      limit: options.limit,
      offset: options.limit * (options.page - 1),
      orderBy(schema, { asc, desc }) {
        return options.sortAsc ? asc((schema as any)[options.sortBy]) : desc((schema as any)[options.sortBy])
      },
      where(_, { or, and }) {
        const conditions = []
        if (options.keyword && options.keywordLower) {
          conditions.push(
            or(
              // Convert action and subject, which are enum, to text for case-insensitive search
              sql`${sysPermissionTable.action}::text ILIKE ${`%${options.keyword}%`}`,
              sql`${sysPermissionTable.subject}::text ILIKE ${`%${options.keyword}%`}`,
            ),
          )
        }

        if (options.roleId) {
          conditions.push(
            sql`${sysPermissionTable.id} IN (
              SELECT permission_id FROM ${sysRolePermissionTable} WHERE role_id = ${options.roleId}
            )`,
          )
        }

        return and(...conditions)
      },
    })

    const { total } = await getPermissionCount()

    return {
      data: sysPermissions,
      total,
    }
  }

  async function getPermissionById(id: string) {
    const { data } = await getRecordByKey('id', id)

    return { data }
  }

  async function createPermission(body: any) {
    const existingPermission = await db
      .select()
      .from(sysPermissionTable)
      .where(
        and(
          eq(sysPermissionTable.action, body.action),
          eq(sysPermissionTable.subject, body.subject),
        ),
      )
      .limit(1)

    if (existingPermission.length > 0) {
      throw new Error(`Permission with action "${body.action}" and subject "${body.subject}" already exists.`)
    }

    const permission = await createRecord(body)

    return permission
  }

  async function updatePermissionById(id: string, body: any) {
    const { data } = await updateRecordByKey('id', id, body)

    return { data }
  }

  async function deletePermissionById(id: string) {
    const { data } = await deleteRecordByKey('id', id)

    return { data }
  }

  function getPermissionCount() {
    return countRecords()
  }

  return {
    getPermissionsPaginated,
    getPermissionById,
    createPermission,
    updatePermissionById,
    deletePermissionById,
    getPermissionCount,
  }
}

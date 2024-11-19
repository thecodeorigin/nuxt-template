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
      // Don't need this for now
      // with: {
      //   roles: {
      //     with: {
      //       role: true,
      //     },
      //   },
      // },
      limit: options.limit,
      offset: options.limit * (options.page - 1),
      orderBy(schema, { asc, desc }) {
        return options.sortAsc
          ? asc((schema as any)[options.sortBy])
          : desc((schema as any)[options.sortBy])
      },
      where(schema, { or, ilike }) {
        if (options.keyword && options.keywordLower) {
          return or(
            ilike(schema.action, `%${options.keyword}%`),
            ilike(schema.subject, `%${options.keyword}%`),
            ilike(schema.action, `%${options.keywordLower}%`),
            ilike(schema.subject, `%${options.keywordLower}%`),
          )
        }
      },
    })

    const { total } = await countRecords()

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

  return {
    getPermissionsPaginated,
    getPermissionById,
    createPermission,
    updatePermissionById,
    deletePermissionById,
  }
}

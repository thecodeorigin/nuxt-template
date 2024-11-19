import type { ParsedFilterQuery } from '@base/server/utils/filter'
import { sysRolePermissionTable, sysRoleTable } from '@base/server/db/schemas'
import { eq } from 'drizzle-orm'
import { useCrud } from './useCrud'

export function useRoleCrud() {
  const {
    createRecord,
    updateRecordByKey,
    deleteRecordByKey,
    countRecords,
  } = useCrud(sysRoleTable, {
    searchBy: ['name'],
  })

  async function getRolesPaginated(options: ParsedFilterQuery) {
    const sysRoles = await db.query.sysRoleTable.findMany({
      with: {
        permissions: {
          columns: {
            role_id: false,
            permission_id: false,
          },
          with: {
            permission: {
              columns: {
                id: true,
                action: true,
                subject: true,
              },
            },
          },
        },
      },
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
            ilike(schema.name, `%${options.keyword}%`),
            ilike(schema.name, `%${options.keywordLower}%`),
          )
        }
      },
    })

    const { total } = await countRecords()

    return {
      data: sysRoles,
      total,
    }
  }

  async function getRoleById(id: string) {
    const data = await db.query.sysRoleTable.findFirst({
      where: sysRoleTable => eq(sysRoleTable.id, id),
      with: {
        permissions: true,
      },
    })

    return data
  }

  async function updateRoleById(id: string, body: any) {
    const { data } = await updateRecordByKey('id', id, body)

    await db.insert(sysRolePermissionTable).values(body.permissions.map((permissionId: string) => ({
      role_id: data.id,
      permission_id: permissionId,
    })))

    return { data }
  }

  async function createRole(body: any) {
    const { data } = await createRecord(body)

    await db.insert(sysRolePermissionTable).values(body.permissions.map((permissionId: string) => ({
      role_id: data.id,
      permission_id: permissionId,
    })))

    return { data }
  }

  async function deleteRoleById(id: string) {
    const { data } = await deleteRecordByKey('id', id)

    return { data }
  }

  return {
    getRolesPaginated,
    getRoleById,
    createRole,
    updateRoleById,
    deleteRoleById,
  }
}

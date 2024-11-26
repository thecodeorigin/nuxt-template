import type { ParsedFilterQuery } from '@base/server/utils/filter'
import { sysRolePermissionTable, sysRoleTable } from '@base/server/db/schemas'
import { count, eq, ilike, or } from 'drizzle-orm'

export function useRole() {
  async function getRoleCount(options?: ParsedFilterQuery) {
    const data = await db.select({ total: count() }).from(sysRoleTable).where(
      or(
        ilike(sysRoleTable.name, `%${options?.keyword || ''}%`),
        ilike(sysRoleTable.name, `%${options?.keywordLower || ''}%`),
      ),
    )

    return data[0]
  }

  async function getRoles(options: ParsedFilterQuery) {
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

    const { total } = options.withCount
      ? await getRoleCount(options)
      : { total: sysRoles.length }

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

  async function createRole(body: any) {
    const data = await db.insert(sysRoleTable).values({ name: body.name }).returning({ id: sysRoleTable.id })

    if (body.permissions?.length) {
      await db.insert(sysRolePermissionTable).values(body.permissions.map((permissionId: string) => ({
        role_id: data[0].id,
        permission_id: permissionId,
      })))
    }
  }

  async function updateRoleById(id: string, body: any) {
    await db.update(sysRoleTable).set({ name: body.name }).where(eq(sysRoleTable.id, id))

    if (body.permissions?.length) {
      await db.delete(sysRolePermissionTable).where(eq(sysRolePermissionTable.role_id, id))

      await db.insert(sysRolePermissionTable).values(body.permissions.map((permissionId: string) => ({
        role_id: id,
        permission_id: permissionId,
      })))
    }
  }

  async function deleteRoleById(id: string) {
    await db.delete(sysRoleTable).where(eq(sysRoleTable.id, id))
  }

  return {
    getRoles,
    getRoleById,
    createRole,
    updateRoleById,
    deleteRoleById,
    getRoleCount,
  }
}

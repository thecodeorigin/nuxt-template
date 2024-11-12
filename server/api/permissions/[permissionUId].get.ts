import { eq } from 'drizzle-orm'
import { sysPermissionTable } from '@base/server/db/schemas/sys_permissions.schema'

export default defineEventHandler(async (event) => {
  try {
    const { permissionUId } = await defineEventOptions(event, { auth: true, params: ['permissionUId'] })

    const sysPermission = await db.select().from(sysPermissionTable)
      .where(
        eq(sysPermissionTable.id, permissionUId),
      )
      .limit(1)

    setResponseStatus(event, 201)

    return { data: sysPermission[0] }
  }
  catch (error: any) {
    throw parseError(error)
  }
})
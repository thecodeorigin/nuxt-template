import { eq } from 'drizzle-orm'
import { sysPermissionTable } from '@base/server/db/schemas/sys_permissions.schema'

export default defineEventHandler(async (event) => {
  try {
    const { permissionId } = await defineEventOptions(event, { auth: true, params: ['permissionId'] })

    const sysPermission = await db.delete(sysPermissionTable)
      .where(
        eq(sysPermissionTable.id, permissionId),
      )
      .returning()

    setResponseStatus(event, 201)

    return { data: sysPermission[0] }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

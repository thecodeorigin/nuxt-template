import { eq } from 'drizzle-orm'
import { sysPermissionTable } from '@base/server/db/schemas/sys_permissions.schema'

export default defineEventHandler(async (event) => {
  try {
    const { permissionUId } = await defineEventOptions(event, { auth: true, params: ['permissionUId'] })

    const body = await readBody(event)

    const sysPermission = await db.update(sysPermissionTable)
      .set(body)
      .where(eq(sysPermissionTable.id, permissionUId))
      .returning()

    setResponseStatus(event, 201)

    return { data: sysPermission }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

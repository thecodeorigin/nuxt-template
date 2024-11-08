import { eq } from 'drizzle-orm'
import { sysPermissionTable } from '@base/server/db/schemas/sys_permissions.schema'

export default defineEventHandler(async (event) => {
  try {
    const { permissionId } = await defineEventOptions(event, { auth: true, params: ['permissionId'] })

    const body = await readBody(event)

    const sysPermission = await db.update(sysPermissionTable)
      .set(body)
      .where(eq(sysPermissionTable.id, permissionId))
      .returning()

    setResponseStatus(event, 201)

    return { data: sysPermission }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

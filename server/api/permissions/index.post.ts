import { sysPermissionTable } from '@base/server/db/schemas/sys_permissions.schema'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const body = await readBody(event)

    const sysPermission = await db.insert(sysPermissionTable)
      .values(body)
      .returning()

    setResponseStatus(event, 201)

    return { data: sysPermission[0] }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

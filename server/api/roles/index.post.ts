import { sysRoleTable } from '@base/server/db/schemas/sys_roles.schema'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const body = await readBody(event)

    const sysRole = await db.insert(sysRoleTable)
      .values(body)
      .returning()

    setResponseStatus(event, 201)

    return { data: sysRole[0] }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

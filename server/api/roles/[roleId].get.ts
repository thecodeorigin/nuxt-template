import { eq } from 'drizzle-orm'
import { sysRoleTable } from '@base/server/db/schemas/sys_roles.schema'

export default defineEventHandler(async (event) => {
  try {
    const { roleId } = await defineEventOptions(event, { auth: true, params: ['roleId'] })

    const sysRole = await db.select().from(sysRoleTable)
      .where(
        eq(sysRoleTable.id, roleId),
      )
      .limit(1)

    setResponseStatus(event, 201)

    return { data: sysRole[0] }
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})

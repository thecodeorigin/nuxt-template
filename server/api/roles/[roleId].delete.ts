import { eq } from 'drizzle-orm'
import { sysRoleTable } from '@base/server/db/schemas'

export default defineEventHandler(async (event) => {
  try {
    const { roleId } = await defineEventOptions(event, { auth: true, params: ['roleId'] })

    const sysRole = await db.delete(sysRoleTable)
      .where(
        eq(sysRoleTable.id, roleId),
      )
      .returning()

    setResponseStatus(event, 201)

    return { data: sysRole[0] }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

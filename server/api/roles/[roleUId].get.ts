import { eq } from 'drizzle-orm'
import { sysRoleTable } from '@base/server/db/schemas'

export default defineEventHandler(async (event) => {
  try {
    const { roleUId } = await defineEventOptions(event, { auth: true, params: ['roleUId'] })

    const sysRole = await db.select().from(sysRoleTable)
      .where(
        eq(sysRoleTable.id, roleUId),
      )
      .limit(1)

    setResponseStatus(event, 201)

    return { data: sysRole[0] }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

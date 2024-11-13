import { eq } from 'drizzle-orm'
import { sysRoleTable } from '@base/server/db/schemas'

export default defineEventHandler(async (event) => {
  try {
    const { roleUId } = await defineEventOptions(event, { auth: true, params: ['roleUId'] })

    const body = await readBody(event)

    const sysRole = await db.update(sysRoleTable)
      .set(body)
      .where(eq(sysRoleTable.id, roleUId))
      .returning()

    setResponseStatus(event, 201)

    return { data: sysRole }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

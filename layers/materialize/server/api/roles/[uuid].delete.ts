import { eq } from 'drizzle-orm'
import { sysRoleTable } from '@materialize/server/db/schemas/sys_roles.schema'

export default defineEventHandler(async (event) => {
  try {
    const { uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

    const sysRole = await db.delete(sysRoleTable)
      .where(
        eq(sysRoleTable.id, uuid),
      )
      .returning()

    setResponseStatus(event, 201)

    return { data: sysRole[0] }
  }
  catch (error: any) {
    setResponseStatus(event, 404, error.message)
  }
})

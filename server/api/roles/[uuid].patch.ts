import { eq } from 'drizzle-orm'
import { sysRoleTable } from '@base/server/db/schemas/sys_roles.schema'

export default defineEventHandler(async (event) => {
  try {
    const { uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

    const body = await readBody(event)

    const sysRole = await db.update(sysRoleTable)
      .set(body)
      .where(eq(sysRoleTable.id, uuid))
      .returning()

    setResponseStatus(event, 201)

    return { data: sysRole }
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})

import { eq } from 'drizzle-orm'
import { sysUserTable } from '~/server/db/schemas/sys_users.schema'

export default defineEventHandler(async (event) => {
  try {
    const { uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

    const sysUser = await db.delete(sysUserTable)
      .where(
        eq(sysUserTable.id, uuid),
      )
      .returning()

    setResponseStatus(event, 201)

    return { data: sysUser[0] }
  }
  catch (error: any) {
    setResponseStatus(event, 404, error.message)
  }
})

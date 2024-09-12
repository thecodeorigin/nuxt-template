import { eq } from 'drizzle-orm'
import { sysUserTable } from '~/server/db/schemas/sys_users.schema'

export default defineEventHandler(async (event) => {
  try {
    const { uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

    const body = await readBody(event)

    const sysUser = await db.update(sysUserTable)
      .set(body)
      .where(eq(sysUserTable.id, uuid))
      .returning()

    setResponseStatus(event, 201)

    return { data: sysUser }
  }
  catch (error: any) {
    setResponseStatus(event, 400, error.message)
  }
})

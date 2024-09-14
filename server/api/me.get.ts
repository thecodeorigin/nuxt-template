import { eq } from 'drizzle-orm'
import { omit } from 'lodash-es'
import { sysUserTable } from '~/server/db/schemas/sys_users.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const sysUser = await db.select().from(sysUserTable)
      .where(
        eq(sysUserTable.id, session.user!.id!),
      )
      .limit(1)

    setResponseStatus(event, 201)

    return { data: omit(sysUser[0], ['password']) }
  }
  catch (error: any) {
    setResponseStatus(event, 404, error.message)
  }
})

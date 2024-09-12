import { sysUserTable } from '~/server/db/schemas/sys_users.schema'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const body = await readBody(event)

    const sysUser = await db.insert(sysUserTable)
      .values(body)
      .returning()

    setResponseStatus(event, 201)

    return { data: sysUser[0] }
  }
  catch (error: any) {
    setResponseStatus(event, 400, error.message)
  }
})

import { count } from 'drizzle-orm'
import { sysUserTable } from '~/server/db/schemas/sys_users.schema'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const sysUserSubquery = db.select().from(sysUserTable)

    const total = await db.select({ count: count() }).from(sysUserSubquery.as('count'))

    return {
      total,
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})

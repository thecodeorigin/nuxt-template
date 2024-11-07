import { count } from 'drizzle-orm'
import { sysRoleTable } from '@base/server/db/schemas'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const sysRoleSubquery = db.select().from(sysRoleTable)

    const total = await db.select({ count: count() }).from(sysRoleSubquery.as('count'))

    return {
      total,
    }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

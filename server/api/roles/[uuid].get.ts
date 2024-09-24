import { eq } from 'drizzle-orm'
import { sysRoleTable } from '@/server/db/schemas/sys_roles.schema'

export default defineEventHandler(async (event) => {
  try {
    const { uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

    const sysRole = await db.select().from(sysRoleTable)
      .where(
        eq(sysRoleTable.id, uuid),
      )
      .limit(1)

    setResponseStatus(event, 201)

    return { data: sysRole[0] }
  }
  catch (error: any) {
    setResponseStatus(event, 404, error.message)
  }
})

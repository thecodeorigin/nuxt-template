import { eq } from 'drizzle-orm'
import { sysOrganizationTable } from '@base/server/db/schemas'

export default defineEventHandler(async (event) => {
  try {
    const { organizationId } = await defineEventOptions(event, { auth: true, params: ['organizationId'] })

    const sysOrganization = await db.select().from(sysOrganizationTable)
      .where(
        eq(sysOrganizationTable.id, organizationId),
      )
      .limit(1)

    setResponseStatus(event, 201)

    return { data: sysOrganization[0] }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

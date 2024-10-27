import { eq } from 'drizzle-orm'
import { sysOrganizationTable } from '@base/server/db/schemas/sys_organizations.schema'

export default defineEventHandler(async (event) => {
  try {
    const { organizationId } = await defineEventOptions(event, { auth: true, params: ['organizationId'] })

    const sysOrganization = await db.delete(sysOrganizationTable)
      .where(
        eq(sysOrganizationTable.id, organizationId),
      )
      .returning()

    setResponseStatus(event, 201)

    return { data: sysOrganization[0] }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

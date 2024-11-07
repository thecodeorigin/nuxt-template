import { eq } from 'drizzle-orm'
import { sysOrganizationTable } from '@base/server/db/schemas'

export default defineEventHandler(async (event) => {
  try {
    const { organizationId } = await defineEventOptions(event, { auth: true, params: ['organizationId'] })

    const body = await readBody(event)

    const sysOrganization = await db.update(sysOrganizationTable)
      .set(body)
      .where(eq(sysOrganizationTable.id, organizationId))
      .returning()

    setResponseStatus(event, 201)

    return { data: sysOrganization }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

import { sysOrganizationTable } from '@base/server/db/schemas'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const body = await readBody(event)

    const sysOrganization = await db.insert(sysOrganizationTable)
      .values(body)
      .returning()

    setResponseStatus(event, 201)

    return { data: sysOrganization[0] }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

import { useOrganization } from '@base/server/composables/useOrganization'

export default defineEventHandler(async (event) => {
  try {
    const { organizationUId } = await defineEventOptions(event, { auth: true, params: ['organizationUId'] })

    const body = await readBody(event)

    const { updateOrganizationById } = useOrganization()

    const sysOrganization = await updateOrganizationById(organizationUId, body)

    return { data: sysOrganization }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

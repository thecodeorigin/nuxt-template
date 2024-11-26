import { useOrganization } from '@base/server/composables/useOrganization'

export default defineEventHandler(async (event) => {
  try {
    const { organizationUId } = await defineEventOptions(event, { auth: true, params: ['organizationUId'] })

    const { getOrganizationById } = useOrganization()

    const sysOrganization = await getOrganizationById(organizationUId)

    return { data: sysOrganization }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

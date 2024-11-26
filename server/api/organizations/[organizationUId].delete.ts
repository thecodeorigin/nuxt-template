import { useOrganization } from '@base/server/composables/useOrganization'

export default defineEventHandler(async (event) => {
  try {
    const { organizationUId } = await defineEventOptions(event, { auth: true, params: ['organizationUId'] })

    const { deleteOrganizationById } = useOrganization()

    await deleteOrganizationById(organizationUId)
  }
  catch (error: any) {
    throw parseError(error)
  }
})

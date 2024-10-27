import { useOrganizationCrud } from '@base/server/composables/useOrganizationCrud'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const { getOrganizationsPaginated } = useOrganizationCrud()

    const sysOrganizations = await getOrganizationsPaginated(getFilter(event))

    return sysOrganizations
  }
  catch (error: any) {
    throw parseError(error)
  }
})

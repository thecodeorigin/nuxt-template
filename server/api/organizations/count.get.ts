import { useOrganization } from '@base/server/composables/useOrganization'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const { getOrganizationCount } = useOrganization()

    return await getOrganizationCount(getFilter(event))
  }
  catch (error: any) {
    throw parseError(error)
  }
})

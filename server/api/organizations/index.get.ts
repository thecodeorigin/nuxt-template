import { useOrganization } from '@base/server/composables/useOrganization'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const { getOrganizations } = useOrganization()

    return await getOrganizations(
      getFilter(event, {
        sortBy: 'name',
        limit: 100,
      }),
    )
  }
  catch (error: any) {
    throw parseError(error)
  }
})

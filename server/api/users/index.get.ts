import { useUserCrud } from '@base/server/composables/useUserCrud'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const { getUsersPaginated } = useUserCrud()

    const filterOptions: ParsedFilterQuery = getFilter(event)
    filterOptions.sortBy = filterOptions.sortBy || 'created_at'

    const response = await getUsersPaginated(filterOptions)

    setResponseStatus(event, 200)

    return response
  }
  catch (error: any) {
    throw parseError(error)
  }
})

import { useRoleCrud } from '@base/server/composables/useRoleCrud'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const { getRolesPaginated } = useRoleCrud()

    const filterOptions: ParsedFilterQuery = getFilter(event)
    filterOptions.sortBy = filterOptions.sortBy || 'name'
    filterOptions.limit = 100

    return await getRolesPaginated(filterOptions)
  }
  catch (error: any) {
    throw parseError(error)
  }
})

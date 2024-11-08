import { useRoleCrud } from '@base/server/composables/useRoleCrud'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const { getRolesPaginated } = useRoleCrud()

    const filterOptions: ParsedFilterQuery = getFilter(event)
    filterOptions.sortBy = filterOptions.sortBy || 'name'

    const sysRoles = await getRolesPaginated(filterOptions)

    return sysRoles
  }
  catch (error: any) {
    throw parseError(error)
  }
})

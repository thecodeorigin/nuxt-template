import { usePermissionCrud } from '@base/server/composables/usePermissionCrud'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const { getPermissionsPaginated } = usePermissionCrud()

    const filterOptions: ParsedFilterQuery = getFilter(event)
    filterOptions.sortBy = filterOptions.sortBy || 'action'
    filterOptions.limit = 100

    const sysPermissions = await getPermissionsPaginated(filterOptions)

    return sysPermissions
  }
  catch (error: any) {
    throw parseError(error)
  }
})

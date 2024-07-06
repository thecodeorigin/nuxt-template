import is from '@sindresorhus/is'
import { destr } from 'destr'
import { db } from '@/server/fake-db/apps/permissions'

export default defineCachedEventHandler(event => {
  const { q = '', sortBy, page = 1, itemsPerPage = 10, orderBy } = getQuery(event)

  const parsedSortBy = destr(sortBy)
  const sortByLocal = is.string(parsedSortBy) ? parsedSortBy : ''

  const parsedOrderBy = destr(orderBy)
  const orderByLocal = is.string(parsedOrderBy) ? parsedOrderBy : ''

  const parsedItemsPerPage = destr(itemsPerPage)
  const parsedPage = destr(page)

  const itemsPerPageLocal = is.number(parsedItemsPerPage) ? parsedItemsPerPage : 10
  const pageLocal = is.number(parsedPage) ? parsedPage : 1

  const searchQuery = is.string(q) ? q : undefined
  const queryLower = (searchQuery ?? '').toString().toLowerCase()

  let filteredPermissions = db.permissions.filter(
    permissions =>
      permissions.name.toLowerCase().includes(queryLower)
      || permissions.createdDate.toLowerCase().includes(queryLower)
      || permissions.assignedTo.some((i: string) => i.toLowerCase().startsWith(queryLower)),
  )

  // Sorting Permissions
  if (sortByLocal && sortByLocal === 'name') {
    filteredPermissions = filteredPermissions.sort((a, b) => {
      if (orderByLocal === 'asc')
        return a.name.localeCompare(b.name)

      return b.name.localeCompare(a.name)
    })
  }

  return { permissions: paginateArray(filteredPermissions, itemsPerPageLocal, pageLocal), totalPermissions: filteredPermissions.length }
})

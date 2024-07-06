import is from '@sindresorhus/is'
import { destr } from 'destr'
import { db } from '@/server/fake-db/apps/users/index'

export default defineEventHandler(async event => {
  const { q = '', role = null, plan = null, status = null, sortBy, itemsPerPage = 10, page = 1, orderBy } = getQuery(event)

  const searchQuery = is.string(q) ? q : undefined
  const queryLower = (searchQuery ?? '').toString().toLowerCase()

  const parsedSortBy = destr(sortBy)
  const sortByLocal = is.string(parsedSortBy) ? parsedSortBy : ''

  const parsedOrderBy = destr(orderBy)
  const orderByLocal = is.string(parsedOrderBy) ? parsedOrderBy : ''

  const parsedItemsPerPage = destr(itemsPerPage)
  const parsedPage = destr(page)

  const itemsPerPageLocal = is.number(parsedItemsPerPage) ? parsedItemsPerPage : 10
  const pageLocal = is.number(parsedPage) ? parsedPage : 1

  // filter users
  let filteredUsers = db.users.filter(user => ((user.fullName.toLowerCase().includes(queryLower) || user.email.toLowerCase().includes(queryLower)) && user.role === (role || user.role) && user.currentPlan === (plan || user.currentPlan) && user.status === (status || user.status))).reverse()

  // sort users
  if (sortByLocal) {
    if (sortByLocal === 'user') {
      filteredUsers = filteredUsers.sort((a, b) => {
        if (orderByLocal === 'asc')
          return a.fullName.localeCompare(b.fullName)
        else
          return b.fullName.localeCompare(a.fullName)
      })
    }
    if (sortByLocal === 'email') {
      filteredUsers = filteredUsers.sort((a, b) => {
        if (orderByLocal === 'asc')
          return a.email.localeCompare(b.email)
        else
          return b.email.localeCompare(a.email)
      })
    }
    if (sortByLocal === 'role') {
      filteredUsers = filteredUsers.sort((a, b) => {
        if (orderByLocal === 'asc')
          return a.role.localeCompare(b.role)
        else
          return b.role.localeCompare(a.role)
      })
    }
    if (sortByLocal === 'plan') {
      filteredUsers = filteredUsers.sort((a, b) => {
        if (orderByLocal === 'asc')
          return a.currentPlan.localeCompare(b.currentPlan)
        else
          return b.currentPlan.localeCompare(a.currentPlan)
      })
    }
    if (sortByLocal === 'status') {
      filteredUsers = filteredUsers.sort((a, b) => {
        if (orderByLocal === 'asc')
          return a.status.localeCompare(b.status)
        else
          return b.status.localeCompare(a.status)
      })
    }
  }

  const totalUsers = filteredUsers.length

  // total pages
  const totalPages = Math.ceil(totalUsers / itemsPerPageLocal)

  setResponseStatus(event, 200)

  return { users: paginateArray(filteredUsers, itemsPerPageLocal, pageLocal), totalPages, totalUsers, page: pageLocal > Math.ceil(totalUsers / itemsPerPageLocal) ? 1 : page }
})

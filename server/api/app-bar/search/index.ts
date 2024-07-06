import is from '@sindresorhus/is'
import { db } from '@/server/fake-db/app-bar-search/index'
import type { SearchResults } from '@/server/fake-db/app-bar-search/types'

export default defineEventHandler(async event => {
  const { q = '' } = getQuery(event)

  const searchQuery = is.string(q) ? q : undefined
  const queryLowered = (searchQuery ?? '').toString().toLowerCase()

  const filteredSearchData = [] as SearchResults[]

  db.searchItems.forEach(item => {
    if (item.children) {
      const matchingChildren = item.children.filter(
        child => child.title.toLowerCase().includes(queryLowered),
      )

      if (matchingChildren.length > 0) {
        const parentCopy = { ...item }

        if (matchingChildren.length > 5)
          parentCopy.children = matchingChildren.slice(0, 5)

        else
          parentCopy.children = matchingChildren

        filteredSearchData.push(parentCopy)
      }
    }
  })

  if (filteredSearchData.length > 1) {
    filteredSearchData.forEach((item, index) => {
      if (item.children.length > 3)
        filteredSearchData[index].children.splice(0, 3)
    })
  }

  setResponseStatus(event, 200)

  return [...filteredSearchData]
})

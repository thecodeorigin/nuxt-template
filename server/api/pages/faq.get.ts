import is from '@sindresorhus/is'
import { db } from '@/server/fake-db/pages/faq/index'
import type { FaqCategory } from '@/server/fake-db/pages/faq/types'

export default defineEventHandler(async event => {
  const { q = '' } = getQuery(event)

  const searchQuery = is.string(q) ? q : undefined
  const queryLowered = (searchQuery ?? '').toString().toLowerCase()

  const filteredData: FaqCategory[] = []

  Object.entries(db.faqs).forEach(([_, faqObj]) => {
    const filteredQAndA = faqObj.faqs.filter(obj => {
      return obj.question.toLowerCase().includes(queryLowered)
    })

    if (filteredQAndA.length)
      filteredData.push({ ...faqObj, faqs: filteredQAndA })
  })

  setResponseStatus(event, 200)

  return filteredData
})

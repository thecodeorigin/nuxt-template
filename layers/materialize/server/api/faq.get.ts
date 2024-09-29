import { useFaqCrud } from '@materialize/server/composables/useFaqCrud'

export default defineEventHandler(async (event) => {
  const { getFaqQuestions } = useFaqCrud()

  const faqs = await getFaqQuestions(getFilter(event))
  setResponseStatus(event, 200)

  return faqs
})

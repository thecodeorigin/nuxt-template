import { useFaq } from '@base/server/composables/useFaq'

export default defineEventHandler(async (event) => {
  const { getFaqQuestions } = useFaq()

  const faqs = await getFaqQuestions(getFilter(event))
  setResponseStatus(event, 200)

  return faqs
})

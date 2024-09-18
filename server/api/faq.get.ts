import { useUserDeviceCrud } from '../composables/useFaqCrud.ts'

export default defineEventHandler(async (event) => {
  const { category_id, ...body } = getFilter(event)

  const { getFaqQuestions } = useUserDeviceCrud({ category_id })

  const faqs = await getFaqQuestions(body)
  setResponseStatus(event, 200)

  return faqs.data
})

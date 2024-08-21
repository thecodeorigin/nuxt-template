import type { Tables } from '@/server/types/supabase'

type Review = Tables<'sys_landing_page'>

export default defineEventHandler(async (event) => {
  const customerReqBody = await readBody<Partial<Review>>(event)

  const { error } = await supabase.from('sys_landing_page')
    .update({ customer_review_data: customerReqBody.customer_review_data })
    .match({
      id: 'df02f75c-afab-41ef-ab6d-e1aa04d7ec6d',
    })

  if (error) {
    setResponseStatus(event, 400, error.message)
    return { error: error?.message }
  }
  else {
    setResponseStatus(event, 201)
  }

  return { success: true }
})

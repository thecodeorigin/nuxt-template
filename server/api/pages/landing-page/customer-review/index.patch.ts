import { getLandingPageId } from '../landingPageID.get'
import type { Tables } from '@/server/types/supabase'

type Review = Tables<'sys_landing_page'>

export default defineEventHandler(async (event) => {
  const customerReqBody = await readBody<Partial<Review>>(event)

  const landingPageId = await getLandingPageId()

  const { error } = await supabaseAdmin.from('sys_landing_page')
    .update({
      customer_review_data: customerReqBody.customer_review_data,
      customer_review_title: customerReqBody.customer_review_title,
      customer_review_title_desc: customerReqBody.customer_review_title_desc,
    })
    .match({
      id: landingPageId,
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

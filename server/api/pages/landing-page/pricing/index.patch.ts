import type { Tables } from '@/server/types/supabase'

type Team = Tables<'sys_landing_page'>

export default defineEventHandler(async (event) => {
  const priceReqBody = await readBody<Partial<Team>>(event)

  const { error } = await supabaseAdmin.from('sys_landing_page')
    .update({
      pricing_data: priceReqBody.pricing_data,
      pricing_title: priceReqBody.pricing_title,
      pricing_title_desc: priceReqBody.pricing_title_desc,
    })
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

  return { success: true, status: 201 }
})

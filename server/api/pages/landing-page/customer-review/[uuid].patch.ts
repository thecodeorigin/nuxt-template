import type { Tables } from '@/server/types/supabase'

type Review = Tables<'sys_landing_page'>

export default defineEventHandler(async (event) => {
  const { uuid } = await defineEventOptions(event, { auth: true, detail: true })

  const customerReqBody = await readBody<Review>(event)

  const { error } = await supabase.from('posts')
    .update(customerReqBody)
    .match({
      id: uuid,
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

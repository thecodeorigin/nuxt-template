import type { Tables } from '@/server/types/supabase'

type Category = Tables<'categories'>

export default defineEventHandler(async (event) => {
  const { session, uuid } = await defineEventOptions(event, { auth: true, detail: true })

  const post = await readBody<Category>(event)

  const { data, error } = await supabaseAdmin.from('categories')
    .update(post)
    .match({
      id: uuid,
      user_id: session.user!.id!,
    })
    .select()
    .maybeSingle()

  if (error)
    setResponseStatus(event, 400, error.message)
  else
    setResponseStatus(event, 201)

  return { data }
})

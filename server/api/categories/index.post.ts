import type { Tables } from '@/server/types/supabase'

type Category = Tables<'categories'>

export default defineEventHandler(async (event) => {
  const { session } = await defineEventOptions(event, { auth: true })

  const category = await readBody<Category>(event)

  const { data, error } = await supabaseAdmin.from('categories')
    .insert({
      ...category,
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

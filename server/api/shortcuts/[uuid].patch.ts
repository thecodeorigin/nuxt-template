import type { Tables } from '@/server/types/supabase'

type Shortcut = Tables<'user_shortcuts'>

export default defineEventHandler(async (event) => {
  const { session, uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

  const post = await readBody<Shortcut>(event)

  const { data, error } = await supabase.from('user_shortcuts')
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

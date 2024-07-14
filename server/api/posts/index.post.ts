import type { Tables } from '@/server/types/supabase'

type Post = Tables<'posts'>

export default defineEventHandler(async (event) => {
  const session = await setAuthOnlyRoute(event)

  const post = await readBody<Post>(event)

  const { data, error } = await supabase.from('posts')
    .insert({
      ...post,
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

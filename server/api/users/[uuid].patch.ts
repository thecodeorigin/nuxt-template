import type { Tables } from '@/server/types/supabase'

type User = Tables<'sys_users'>

export default defineEventHandler(async (event) => {
  await setAuthOnlyRoute(event)

  const uuid = getUuid(event, 'Missing UUID to get data')

  const post = await readBody<User>(event)

  const { data, error } = await supabase.from('sys_users')
    .update(post)
    .eq('id', uuid)
    .select()
    .maybeSingle()

  if (error)
    setResponseStatus(event, 400, error.message)
  else
    setResponseStatus(event, 201)

  return { data }
})

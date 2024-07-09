import type { Tables } from '@/server/types/supabase'

type User = Tables<'sys_users'>

export default defineEventHandler(async event => {
  const user = await readBody<User>(event)

  const { data, error } = await supabase.from('sys_users').insert(user).select().maybeSingle()

  if (error)
    setResponseStatus(event, 400, error.message)
  else
    setResponseStatus(event, 201)

  return { data }
})

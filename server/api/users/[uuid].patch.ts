import type { Tables } from '@/server/types/supabase'

type User = Tables<'sys_users'>

export default defineEventHandler(async (event) => {
  const { session, uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

  if (session.user.id !== uuid)
    return setResponseStatus(event, 403, 'You are not allowed to update other users')

  const body = await readBody<User>(event)

  const { data, error } = await supabaseAdmin.from('sys_users')
    .update(body)
    .eq('id', uuid)
    .select()
    .maybeSingle()

  if (error)
    setResponseStatus(event, 400, error.message)
  else
    setResponseStatus(event, 201)

  return { data }
})

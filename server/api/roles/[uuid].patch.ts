import type { Tables } from '@/server/types/supabase'

type Role = Tables<'sys_roles'>

export default defineEventHandler(async (event) => {
  const { uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

  const post = await readBody<Role>(event)

  const { data, error } = await supabase.from('sys_roles')
    .update(post)
    .match({
      id: uuid,
    })
    .select()
    .maybeSingle()

  if (error)
    setResponseStatus(event, 400, error.message)
  else
    setResponseStatus(event, 201)

  return { data }
})

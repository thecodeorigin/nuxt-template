import type { Tables } from '@/server/types/supabase'

type Role = Tables<'sys_roles'>

export default defineEventHandler(async (event) => {
  await defineEventOptions(event, { auth: true })

  const post = await readBody<Role>(event)

  const { data, error } = await supabase.from('sys_roles')
    .insert(post)
    .select()
    .maybeSingle()

  if (error)
    setResponseStatus(event, 400, error.message)
  else
    setResponseStatus(event, 201)

  return { data }
})

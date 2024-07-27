import type { Tables } from '@/server/types/supabase'

type Project = Tables<'projects'>

export default defineEventHandler(async (event) => {
  const { session, uuid } = await defineEventOptions(event, { auth: true, detail: true })

  const project = await readBody<Project>(event)

  const { data, error } = await supabaseAdmin.from('projects')
    .update(project)
    .match({
      id: uuid,
      user_id: session.user!.id!,
    })
    .select('*,category:categories(*)')
    .maybeSingle()

  if (error)
    setResponseStatus(event, 400, error.message)
  else
    setResponseStatus(event, 201)

  return { data }
})

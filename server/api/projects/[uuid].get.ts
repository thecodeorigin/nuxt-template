// get project by uuid
export default defineEventHandler(async (event) => {
  const { session, uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

  const { data, error } = await supabaseAdmin
    .from('projects')
    .select()
    .match({
      id: uuid,
      user_id: session.user!.id!,
    })
    .maybeSingle()

  if (error)
    setResponseStatus(event, 400, error.message)
  else if (!data)
    setResponseStatus(event, 404)
  else
    setResponseStatus(event, 200)

  return data
})

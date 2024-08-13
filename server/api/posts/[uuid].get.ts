export default defineEventHandler(async (event) => {
  const { session, uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

  const { data, error } = await supabase.from('posts')
    .select()
    .match({
      id: uuid,
      user_id: session.user!.id!,
    })
    .maybeSingle()

  if (error)
    setResponseStatus(event, 400, error.message)
  else
    setResponseStatus(event, 201)

  return { data }
})

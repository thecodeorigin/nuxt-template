export default defineEventHandler(async (event) => {
  const { session, uuid } = await defineEventOptions(event, { auth: true, detail: true })

  const { data, error } = await supabase.from('categories')
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

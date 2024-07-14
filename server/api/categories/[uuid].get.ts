export default defineEventHandler(async (event) => {
  const session = await setAuthOnlyRoute(event)

  const uuid = getUuid(event, 'Missing UUID to get data')

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

export default defineEventHandler(async (event) => {
  await setAuthOnlyRoute(event)

  const uuid = getUuid(event, 'Missing UUID to get data')

  const { data, error } = await supabase.from('sys_roles')
    .delete()
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

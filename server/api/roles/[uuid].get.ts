export default defineEventHandler(async (event) => {
  const { uuid } = await defineEventOptions(event, { auth: true, detail: true })

  const { data, error } = await supabase.from('sys_roles')
    .select()
    .match({
      id: uuid,
    })
    .maybeSingle()

  if (error)
    setResponseStatus(event, 400, error.message)
  else
    setResponseStatus(event, 201)

  return { data }
})

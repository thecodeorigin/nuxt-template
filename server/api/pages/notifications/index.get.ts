export default defineEventHandler(async (event) => {
  const { session } = await defineEventOptions(event, { auth: true, detail: true })

  const query = getQuery(event)

  const offset = Number(query.offset)
  const limit = Number(query.limit)

  const { data, error } = await supabaseAdmin.from('sys_notifications')
    .select()
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit)

  if (error) {
    setResponseStatus(event, 400, error.message)
  }
  else {
    setResponseStatus(event, 201)
  }

  return data
})

export default defineEventHandler(async (event) => {
  const { session } = await defineEventOptions(event, { auth: true, detail: true })

  const { limit = 10, page = 1 } = getFilter(event)

  const { data, error } = await supabaseAdmin.from('sys_notifications')
    .select()
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (error) {
    setResponseStatus(event, 400, error.message)
  }
  else {
    setResponseStatus(event, 201)
  }

  return data
})

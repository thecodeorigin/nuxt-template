export default defineEventHandler(async (event) => {
  const { session } = await defineEventOptions(event, { auth: true, detail: true })
  const query = getQuery(event)
  const { data, error } = await supabaseAdmin.from('sys_notifications').select().eq('user_id', session.user.id).order('created_at', { ascending: false }).range(query.start as number, query.end as number)

  if (error) {
    setResponseStatus(event, 400, error.message)
  }
  else {
    setResponseStatus(event, 201)
  }

  return data
})

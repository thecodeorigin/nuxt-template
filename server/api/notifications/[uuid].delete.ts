export default defineEventHandler(async (event) => {
  const { uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

  const { data, error } = await supabaseAdmin.from('sys_notifications')
    .delete().eq('id', uuid).maybeSingle()

  if (error)
    setResponseStatus(event, 400, error.message)
  else
    setResponseStatus(event, 200)

  return { data }
})

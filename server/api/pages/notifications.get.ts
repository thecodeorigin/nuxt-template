export default defineEventHandler(async (event) => {
  const { data } = await supabaseAdmin.from('sys_notifications').select()
  const { data: me } = await supabaseAdmin.from('sys_users').select().eq('email', 'admin@demo.com').maybeSingle()
  setResponseStatus(event, 200)
  console.log('me:', me)
  console.log('data:', data)

  return data
})

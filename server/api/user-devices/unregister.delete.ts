export default defineEventHandler(async (event) => {
  const { session } = await defineEventOptions(event, { auth: true })
  const { token } = await readBody(event)
  const { error } = await supabaseAdmin.from('user_devices').delete().match({
    user_id: session.user.id,
    token_device: token,
  })
  if (error) {
    setResponseStatus(event, 500)
    return { error: error.message }
  }
  return { message: 'Token unregistration successful' }
})

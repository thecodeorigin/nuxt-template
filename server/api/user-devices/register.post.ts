export default defineEventHandler(async (event) => {
  const { session } = await defineEventOptions(event, { auth: true })
  const { token } = await readBody(event)
  const { data, error } = await supabaseAdmin.from('user_devices').select().match({
    user_id: session.user.id,
    token_device: token,
  })
  if (error) {
    setResponseStatus(event, 500)
    return { error: error.message }
  }
  else if (data.length === 0) {
    const { data: res, error } = await supabaseAdmin.from('user_devices').insert({
      user_id: session.user.id,
      token_device: token,
    }).select()
    if (error) {
      setResponseStatus(event, 500)
      return { error: error.message,
      }
    }
    return { message: 'Token registration successful', token: res }
  }
  return { message: 'Token registration successful' }
})

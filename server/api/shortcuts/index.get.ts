export default defineEventHandler(async (event) => {
  const { session } = await defineEventOptions(event, { auth: true })

  const { data, error } = await supabaseAdmin.from('user_shortcuts')
    .select('*')
    .match({
      user_id: session.user.id,
    })

  if (error) {
    setResponseStatus(event, 400, error.message)

    return error
  }

  return data || []
})

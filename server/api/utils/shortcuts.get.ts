export default defineEventHandler(async (event) => {
  const session = await setAuthOnlyRoute(event, 'You must be signed in to get your data.')

  const { data, error } = await supabaseAdmin.from('user_shortcuts')
    .select('*')
    .match({
      user_id: session.user!.id!,
    })

  if (error) {
    setResponseStatus(event, 500, error.message)

    return error
  }

  return data || []
})

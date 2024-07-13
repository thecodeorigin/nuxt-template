export default defineEventHandler(async (event) => {
  const session = await setAuthOnlyRoute(event, 'You must be signed in to get your data.')

  const { data, error } = await supabaseAdmin.from('categories')
    .select('*', { count: 'exact', head: true })
    .match({
      user_id: session.user!.id!,
    })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  return data
})

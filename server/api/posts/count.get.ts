export default defineEventHandler(async (event) => {
  const session = await setAuthOnlyRoute(event)

  const { count, error } = await supabaseAdmin.from('posts')
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

  return count
})

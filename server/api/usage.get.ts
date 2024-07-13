export default defineEventHandler(async (event) => {
  const session = await setAuthOnlyRoute(event, 'You must be signed in to get your data.')

  const { count: countPosts, error: errorPosts } = await supabaseAdmin.from('posts')
    .select('*', { count: 'exact', head: true })
    .match({
      user_id: session.user!.id!,
    })

  if (errorPosts) {
    setResponseStatus(event, 500, errorPosts.message)

    return errorPosts
  }

  return {
    countPosts: countPosts || 0,
  }
})

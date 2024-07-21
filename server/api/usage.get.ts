export default defineEventHandler(async (event) => {
  const { session } = await defineEventOptions(event, { auth: true })

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

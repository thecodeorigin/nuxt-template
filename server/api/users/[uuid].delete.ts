export default defineEventHandler(async (event) => {
  const userId = getUuid(event, 'User uuid is required to get user details')

  const { data: user } = await supabase.from('sys_users').delete().eq('id', userId).maybeSingle()

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  return user
})
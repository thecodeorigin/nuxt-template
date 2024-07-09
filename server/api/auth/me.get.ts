export default defineEventHandler(async event => {
  const session = await setAuthOnlyRoute(event, 'You must be signed in to get your data.')

  const { data } = await supabase.from('sys_users').select().eq('email', session.user!.email!).maybeSingle()

  if (!data) {
    throw createError({
      statusCode: 403,
      statusMessage: `User with email "${session.user?.email}" not found in records.`,
    })
  }

  return data
})

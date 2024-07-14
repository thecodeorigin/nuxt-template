export default defineEventHandler(async (event) => {
  await setAuthOnlyRoute(event)

  const uuid = getUuid(event, 'Missing UUID to get data')

  const { data: user } = await supabase.from('sys_users').select().eq('id', uuid).maybeSingle()

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not found',
    })
  }

  return user
})

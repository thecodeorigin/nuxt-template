export default defineEventHandler(async (event) => {
  await setAuthOnlyRoute(event)

  const uuid = getUuid(event, 'Missing UUID to get data')

  const { data: shortcut } = await supabase.from('user_shortcuts').select().eq('id', uuid).maybeSingle()

  if (!shortcut) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not found',
    })
  }

  return shortcut
})

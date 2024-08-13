export default defineEventHandler(async (event) => {
  const { uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

  const { data: shortcut } = await supabase.from('user_shortcuts').delete().eq('id', uuid).maybeSingle()

  if (!shortcut) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not found',
    })
  }

  return shortcut
})

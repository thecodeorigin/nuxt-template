export default defineEventHandler(async (event) => {
  await setAuthOnlyRoute(event, 'You must be signed in to get your data.')

  const { data, error } = await supabaseAdmin.from('sys_roles').select('*, permissions:sys_permissions(*)')

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  return data
})

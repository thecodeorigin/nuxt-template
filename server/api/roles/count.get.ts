export default defineEventHandler(async (event) => {
  await setAuthOnlyRoute(event)

  const { count, error } = await supabaseAdmin.from('sys_roles')
    .select('*', { count: 'exact', head: true })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  return count
})

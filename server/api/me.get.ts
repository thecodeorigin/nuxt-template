export default defineEventHandler(async (event) => {
  const { session } = await defineEventOptions(event, { auth: true })

  const { data } = await supabaseAdmin.from('sys_users').select().eq('email', session.user!.email!).maybeSingle()

  if (!data) {
    throw createError({
      statusCode: 403,
      statusMessage: `User with email "${session.user?.email}" not found in records.`,
    })
  }

  return data
})

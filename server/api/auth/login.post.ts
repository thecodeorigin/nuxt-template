export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  if (!email || !password) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Email and Password is required to login',
      data: {
        email: ['Email and Password is required to login'],
      },
    })
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw createError({
      statusCode: 403,
      statusMessage: error.message,
    })
  }

  const { data } = await supabaseAdmin.from('sys_users').select().eq('email', email).maybeSingle()

  if (!data) {
    throw createError({
      statusCode: 403,
      statusMessage: `User with email "${email}" not found in records.`,
    })
  }

  return data
})

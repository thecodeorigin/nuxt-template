import { AuthError } from '@supabase/supabase-js'

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
    setResponseStatus(event, error.status, error.message)

    return error
  }

  const { data } = await supabaseAdmin.from('sys_users').select().eq('email', email).maybeSingle()

  if (!data) {
    setResponseStatus(event, 404, `User with email "${email}" not found in records.`)

    return new AuthError(`User with email "${email}" not found in records.`, 404)
  }

  return data
})

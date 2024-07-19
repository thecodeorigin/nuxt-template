import { AuthError, type EmailOtpType } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const type = body.type as Extract<EmailOtpType, 'signup' | 'email_change'>
  const email = body.email as string

  const { data: user } = await supabaseAdmin.from('sys_users').select('email').eq('email', email).maybeSingle()

  if (!user) {
    setResponseStatus(event, 404, 'User not found')

    return new AuthError('User not found', 404)
  }

  const { data, error } = await supabaseAdmin.auth.resend({
    type,
    email,
  })

  if (error) {
    setResponseStatus(event, error.status, error.message)

    return error
  }

  return data
})

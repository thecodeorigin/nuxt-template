import type { EmailOtpType } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const type = body.type as EmailOtpType
  const token = body.token as string

  const { data, error } = await supabaseAdmin.auth.verifyOtp({
    token_hash: token,
    type,
  })

  if (error) {
    setResponseStatus(event, error.status, error.message)

    return error
  }

  return data.user
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = query.token as string

  const { data } = await supabaseAdmin.auth.verifyOtp({
    token_hash: token,
    type: 'signup',
  })

  if (!data.session?.user) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Cannot verify email!',
    })
  }

  return data.user
})

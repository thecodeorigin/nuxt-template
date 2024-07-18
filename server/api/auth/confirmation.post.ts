export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = body.email as string

  const { data } = await supabaseAdmin.auth.resend({
    type: 'signup',
    email,
  })

  return data
})

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  if (!email || !password) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Email and Password is required to signup',
      data: {
        email: ['Email and Password is required to signup'],
      },
    })
  }

  const { data: signedUpData, error: signedUpError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signedUpError) {
    throw createError({
      statusCode: 403,
      statusMessage: signedUpError.message,
    })
  }

  if (signedUpData.user) {
    const { data: editorRole } = await supabaseAdmin.from('sys_roles').select().eq('name', 'Editor').maybeSingle()

    if (!editorRole) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Cannot sign up user!',
      })
    }

    await supabaseAdmin.from('sys_users').upsert({
      id: signedUpData.user.id,
      email: signedUpData.user.email!,
      phone: '',
      full_name: signedUpData.user?.user_metadata.name,
      avatar_url: signedUpData.user?.user_metadata.avatar_url,
      payment_method: {},
      billing_address: {},
      role_id: editorRole.id,
    })
  }
})

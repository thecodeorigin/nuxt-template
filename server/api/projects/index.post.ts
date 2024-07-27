export default defineEventHandler(async (event) => {
  const { session } = await defineEventOptions(event, { auth: true })
  const { category_id, title, description } = await readBody(event)

  const { data, error } = await supabaseAdmin.from('projects')
    .insert({
      category_id,
      title,
      description,
      user_id: session.user!.id!,
    })
    .select('*,category:categories(*)')
    .maybeSingle()

  if (error)
    setResponseStatus(event, 400, error.message)
  else
    setResponseStatus(event, 201)

  return { data }
})

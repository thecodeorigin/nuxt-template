export default defineEventHandler(async (event) => {
  const { session, uuid } = await defineEventOptions(event, { auth: true, detail: true })

  const { data, error } = await supabase.from('sys_landing_page')
    .select('customer_review_data')
    .match({
      id: uuid,
      user_id: session.user!.id!,
    })
    .single()

  if (error) {
    setResponseStatus(event, 400, error.message)
    return { error: error?.message }
  }

  if (!data || !data.customer_review_data) {
    setResponseStatus(event, 404, 'Data not found')
    return { error: 'Data not found' }
  }

  setResponseStatus(event, 200)
  return { data }
})

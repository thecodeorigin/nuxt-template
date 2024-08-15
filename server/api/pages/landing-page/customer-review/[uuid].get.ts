export default defineEventHandler(async (event) => {
  const { uuid } = await defineEventOptions(event, { auth: true, detail: true })

  const { data, error } = await supabase.from('sys_landing_page')
    .select('customer_review_data')
    .eq('id: id->> uuid', uuid)
    .single()

  console.log('««««« data »»»»»', data)

  if (error) {
    setResponseStatus(event, 400, error.message)
    return { error: error?.message }
  }

  if (!data) {
    setResponseStatus(event, 404, 'Data not found')
    return { error: 'Data not found' }
  }

  setResponseStatus(event, 200)
  return { data }
})

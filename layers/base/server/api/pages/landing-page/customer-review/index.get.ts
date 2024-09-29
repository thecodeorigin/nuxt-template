export default defineEventHandler(async (event) => {
  const { data, error } = await supabaseAdmin
    .from('sys_landing_page')
    .select('customer_review_data')

  if (error) {
    setResponseStatus(event, 400, error.message)
    return { error: error.message }
  }
  else {
    setResponseStatus(event, 201)
    if (data.length === 0) {
      console.log('No data returned from Supabase')
    }
    return data[0]
  }
})

export default defineEventHandler(async (event) => {
  const { uuid } = await defineEventOptions(event, { auth: true })

  const { data, error } = await supabase
    .from('sys_landing_page')
    .select('customer_review_data')
    .filter('customer_review_data->>id', 'eq', uuid)
    .maybeSingle()

  if (error) {
    setResponseStatus(event, 400, error.message)
    return { error: error?.message }
  }

  if (!data) {
    setResponseStatus(event, 404, 'Data not found')
    return { error: 'Data not found' }
  }

  // If you want to return all matching reviews:
  // return { data: data.map(row => row.customer_review_data) };

  // If you want to return the first matching review (assuming unique IDs):
  return { data }
})

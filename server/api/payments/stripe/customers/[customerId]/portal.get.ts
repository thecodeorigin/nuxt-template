export default defineEventHandler(async (event) => {
  const { customerId } = await defineEventOptions(event, { auth: true, params: ['customerId'] })

  const query = getQuery(event)

  const { url } = await createStripeSelfServicePortal(customerId, query.redirectPath as string)

  return sendRedirect(event, url)
})

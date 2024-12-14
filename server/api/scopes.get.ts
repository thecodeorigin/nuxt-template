export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    return await getUserScopes()
  }
  catch (error: any) {
    throw parseError(error)
  }
})

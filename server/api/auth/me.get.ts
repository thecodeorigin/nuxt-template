export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const client = useLogtoClient()

    const user = await client.fetchUserInfo()

    return {
      data: user,
    }
  }
  catch (error) {
    throw parseError(error)
  }
})

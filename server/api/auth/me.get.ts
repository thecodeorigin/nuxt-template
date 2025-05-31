export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { getUserById } = useUser()

    // Get the user data from our database
    const user = await getUserById(session.id)

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found',
      })
    }

    return {
      data: user,
    }
  }
  catch (error: any) {
    logger.error('[User API] Error fetching user:', error)
    throw parseError(error)
  }
})

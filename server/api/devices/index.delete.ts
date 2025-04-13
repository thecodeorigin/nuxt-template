export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { token } = await readBody(event)

    const { deleteUserDeviceToken } = useUserDevice()

    await deleteUserDeviceToken(session.sub, token)

    return { message: 'Token unregistration successful' }
  }
  catch (error: any) {
    logger.error('[Device API] Error unregistering device token:', error)

    throw parseError(error)
  }
})

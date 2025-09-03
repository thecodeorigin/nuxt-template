export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { token } = await readBody(event)

    const { deleteDeviceToken } = useDeviceToken()

    await deleteDeviceToken(session.id, token)

    return { message: 'Token unregistration successful' }
  }
  catch (error: any) {
    console.error('[Device API] Error unregistering device token:', error)

    throw parseError(error)
  }
})

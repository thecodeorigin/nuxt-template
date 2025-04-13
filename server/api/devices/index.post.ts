import { z } from 'zod'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { token } = await readValidatedBody(event, z.object({ token: z.string() }).parse)

    const { getUserDeviceToken, createUserDeviceToken } = useUserDevice()

    const existingDeviceToken = await getUserDeviceToken(session.sub, token)

    if (!existingDeviceToken) {
      const createdToken = await createUserDeviceToken(session.sub, token)

      return { message: 'Token registration successful', token: createdToken[0].token_device }
    }

    return { message: 'Token registration successful' }
  }
  catch (error: any) {
    logger.error('[Device API] Error registering device token:', error)

    throw parseError(error)
  }
})

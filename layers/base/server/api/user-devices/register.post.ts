import { useUserDeviceCrud } from '@base/server/composables/useUserDeviceCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })
    const { token } = await readBody(event)

    const { getUserDeviceToken, createUserDeviceToken } = useUserDeviceCrud({ user_id: session.user.id })
    const dataTokenExists = await getUserDeviceToken(token)

    if (!dataTokenExists?.data) {
      const tokenRegistered = await createUserDeviceToken({
        user_id: session.user.id,
        token_device: token,
      })
      return { message: 'Token registration successful', token: tokenRegistered.data.token_device }
    }
    return { message: 'Token registration successful' }
  }
  catch (error: any) {
    throw createError(
      {
        statusCode: 500,
        statusMessage: error.message,
      },
    )
  }
})

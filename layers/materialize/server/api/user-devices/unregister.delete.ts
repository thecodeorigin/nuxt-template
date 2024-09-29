import { useUserDeviceCrud } from '@materialize/server/composables/useUserDeviceCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })
    const { token } = await readBody(event)

    const { deleteUserDeviceToken } = useUserDeviceCrud({ user_id: session.user.id })
    await deleteUserDeviceToken(token)
    setResponseStatus(event, 200)
    return { message: 'Token unregistration successful' }
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

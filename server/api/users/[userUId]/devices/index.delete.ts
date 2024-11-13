import { useUserDeviceCrud } from '@base/server/composables/useUserDeviceCrud'

export default defineEventHandler(async (event) => {
  try {
    const { userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })
    const { token } = await readBody(event)

    const { deleteUserDeviceToken } = useUserDeviceCrud({ user_id: userUId })
    await deleteUserDeviceToken(token)
    setResponseStatus(event, 200)
    return { message: 'Token unregistration successful' }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

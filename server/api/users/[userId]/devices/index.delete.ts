import { useUserDevice } from '@base/server/composables/useUserDevice'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await defineEventOptions(event, { auth: true, params: ['userId'] })
    const { token } = await readBody(event)

    const { deleteUserDeviceToken } = useUserDevice({ user_id: userId })
    await deleteUserDeviceToken(token)
    setResponseStatus(event, 200)
    return { message: 'Token unregistration successful' }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

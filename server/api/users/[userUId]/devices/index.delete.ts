import { useUserDevice } from '@base/server/composables/useUserDevice'

export default defineEventHandler(async (event) => {
  try {
    const { userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })
    const { token } = await readBody(event)

    const { deleteUserDeviceToken } = useUserDevice({ user_id: userUId })
    await deleteUserDeviceToken(token)
    setResponseStatus(event, 200)
    return { message: 'Token unregistration successful' }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

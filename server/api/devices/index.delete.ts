import { useUserDevice } from '@base/server/composables/useUserDevice'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { token } = await readBody(event)

    const { deleteUserDeviceToken } = useUserDevice()

    await deleteUserDeviceToken(session.sub, token)

    return { message: 'Token unregistration successful' }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

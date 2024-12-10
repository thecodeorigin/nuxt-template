import { useUser } from '@base/server/composables/useUser'

export default defineEventHandler(async (event) => {
  const nitroApp = useNitroApp()
  try {
    const { userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })

    const { deleteUserById } = useUser()

    const response = await deleteUserById(userUId)

    nitroApp.hooks.callHook('log:info', {
      message: 'User deleted',
      data: response,
    })

    setResponseStatus(event, 201)

    return response
  }
  catch (error: any) {
    throw parseError(error)
  }
})

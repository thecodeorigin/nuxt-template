import { useUserCrud } from '@base/server/composables/useUserCrud'

export default defineEventHandler(async (event) => {
  const nitroApp = useNitroApp()
  try {
    const { userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })

    const { deleteUserById } = useUserCrud()

    const response = await deleteUserById(userUId)

    nitroApp.hooks.callHook('logging:info', {
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

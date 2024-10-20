import { useUserDeviceCrud } from '@base/server/composables/useUserDeviceCrud'

export default defineEventHandler(async (event) => {
  const { session, userId } = await defineEventOptions(event, { auth: true, params: ['userId'] })

  const nitroApp = useNitroApp()

  try {
    const { token } = await readBody(event)

    const { getUserDeviceToken, createUserDeviceToken } = useUserDeviceCrud({ user_id: userId })
    const dataTokenExists = await getUserDeviceToken(token)

    if (!dataTokenExists?.data) {
      const tokenRegistered = await createUserDeviceToken({
        user_id: userId,
        token_device: token,
      })
      return { message: 'Token registration successful', token: tokenRegistered.data.token_device }
    }
    return { message: 'Token registration successful' }
  }
  catch (error: any) {
    const _error = parseError(error)

    if (_error.data?.code === '23503')
      nitroApp.hooks.callHook('user:cache:clear', { providerAccountId: session.user.providerAccountId })

    throw _error
  }
})

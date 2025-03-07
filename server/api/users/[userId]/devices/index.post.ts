import { useUserDeviceCrud } from '@base/server/composables/useUserDeviceCrud'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const { session, userId } = await defineEventOptions(event, { auth: true, params: ['userId'] })

  const nitroApp = useNitroApp()

  try {
    const { token } = await readValidatedBody(event, z.object({ token: z.string() }).parse)

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
      await nitroApp.hooks.callHook('session:cache:clear', { providerAccountId: session.sub })

    throw _error
  }
})

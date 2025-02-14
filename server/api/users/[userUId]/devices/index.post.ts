import { useUserDeviceCrud } from '@base/server/composables/useUserDeviceCrud'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const { session, userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })

  const nitroApp = useNitroApp()

  try {
    const { token } = await readValidatedBody(event, z.object({ token: z.string() }).parse)

    const { getUserDeviceToken, createUserDeviceToken } = useUserDeviceCrud({ user_id: userUId })
    const dataTokenExists = await getUserDeviceToken(token)

    if (!dataTokenExists?.data) {
      const tokenRegistered = await createUserDeviceToken({
        user_id: userUId,
        token_device: token,
      })
      return { message: 'Token registration successful', token: tokenRegistered.data.token_device }
    }
    return { message: 'Token registration successful' }
  }
  catch (error: any) {
    const _error = parseError(error)

    if (_error.data?.code === '23503')
      await nitroApp.hooks.callHook('session:cache:clear', { providerAccountId: session.user.providerAccountId })

    throw _error
  }
})

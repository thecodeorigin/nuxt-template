import { useUserCrud } from '@base/server/composables/useUserCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const body = await readBody(event)

    return tryWithCache(
      getStorageSessionKey(session.user.providerAccountId),
      async () => {
        const { updateUserByEmail } = useUserCrud()

        const sysUser = await updateUserByEmail(session.user!.email, body)

        setResponseStatus(event, 201)

        return sysUser
      },
    )
  }
  catch (error: any) {
    throw parseError(error)
  }
})

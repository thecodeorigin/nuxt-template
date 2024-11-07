import { useUserCrud } from '@base/server/composables/useUserCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const body = await readBody(event)

    const { updateUserByEmail } = useUserCrud()

    const sysUser = await updateUserByEmail(session.user!.email, body)

    const storage = useStorage('mongodb')
    const sessionKey = getStorageSessionKey(session.user.providerAccountId)

    await storage.setItem(sessionKey, sysUser.data)

    setResponseStatus(event, 201)

    return sysUser
  }
  catch (error: any) {
    throw parseError(error)
  }
})

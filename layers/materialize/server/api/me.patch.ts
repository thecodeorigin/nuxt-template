import { useUserCrud } from '@materialize/server/composables/useUserCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const body = await readBody(event)

    const { updateUserById } = useUserCrud()

    const sysUser = await updateUserById(session.user!.id!, body)

    const storage = useStorage('redis')
    const sessionKey = getStorageSessionKey(sysUser.data.email!)

    storage.setItem(sessionKey, {
      ...session,
      user: sysUser.data,
    })

    setResponseStatus(event, 201)

    return sysUser
  }
  catch (error: any) {
    setResponseStatus(event, 400, error.message)
  }
})

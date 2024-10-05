import { useUserCrud } from '@base/server/composables/useUserCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { getUserById } = useUserCrud()

    const sysUser = await getUserById(session.user!.id!)

    setResponseStatus(event, 201)

    return sysUser
  }
  catch (error: any) {
    setResponseStatus(event, 404, error.message)
  }
})

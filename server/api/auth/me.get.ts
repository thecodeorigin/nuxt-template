import type { LogtoUser } from '@base/server/types/logto'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const client = useLogtoClient()

    const { getUserProfileById } = useUserProfile()

    const user = (await client.fetchUserInfo()) as LogtoUser

    const userProfile = await getUserProfileById(user.sub)

    return {
      data: {
        ...user,
        custom_data: {
          ...user.custom_data,
          credit: Number(userProfile?.credit || 0) || user.custom_data.credit || 0,
        },
      } as LogtoUser,
    }
  }
  catch (error: any) {
    logger.error('[Me API] Error fetching user info:', error)

    throw parseError(error)
  }
})

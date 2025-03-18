import type { LogtoUser } from '@base/server/types/logto'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const client = useLogtoClient()

    const user = await client.fetchUserInfo()

    return {
      data: user as LogtoUser,
    }
  }
  catch (error) {
    throw parseError(error)
  }
})

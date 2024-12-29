import { useNotification } from '@base/server/composables/useNotification'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await defineEventOptions(event, { auth: true, params: ['userId'] })

    const queryRestrict = { user_id: userId, markAllRead: true }
    const { markAllRead } = useNotification(queryRestrict)
    const response = await markAllRead()

    return response
  }
  catch (error: any) {
    throw parseError(error)
  }
})

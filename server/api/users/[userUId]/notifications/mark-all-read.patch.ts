import { useNotification } from '@base/server/composables/useNotification'

export default defineEventHandler(async (event) => {
  try {
    const { userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })

    const queryRestrict = { user_id: userUId, markAllRead: true }
    const { markAllRead } = useNotification(queryRestrict)
    const response = await markAllRead()

    return response
  }
  catch (error: any) {
    throw parseError(error)
  }
})

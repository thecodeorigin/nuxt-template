import { useNotification } from '@base/server/composables/useNotification'

export default defineEventHandler(async (event) => {
  try {
    const { userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })

    const queryRestrict = { user_id: userUId, markAllUnread: true }
    const { markAllUnread } = useNotification(queryRestrict)
    const response = await markAllUnread()

    return response
  }
  catch (error: any) {
    throw parseError(error)
  }
})

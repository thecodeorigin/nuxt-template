import { useNotification } from '@base/server/composables/useNotification'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { markAllUnread } = useNotification()

    return markAllUnread(session.sub)
  }
  catch (error: any) {
    throw parseError(error)
  }
})

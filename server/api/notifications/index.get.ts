import { useNotification } from '@base/server/composables/useNotification'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { getNotificationsPaginated } = useNotification()

    return getNotificationsPaginated(session.sub, getFilter(event))
  }
  catch (error: any) {
    throw parseError(error)
  }
})

import { useNotification } from '@base/server/composables/useNotification'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { markAllRead } = useNotification()

    return markAllRead(session.sub)
  }
  catch (error: any) {
    throw parseError(error)
  }
})

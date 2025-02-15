import admin from 'firebase-admin'
import { useUserDeviceCrud } from '@base/server/composables/useUserDeviceCrud'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  try {
    const { user_id } = await readValidatedBody(
      event,
      z.object({ user_id: z.string().min(1, 'User ID is required!') }).parse,
    )

    const service = getFirebaseServiceAccount()

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(service),
      })
    }

    const { getUserDeviceAllTokens } = useUserDeviceCrud({ user_id })
    const response = await getUserDeviceAllTokens({} as ParsedFilterQuery)

    if (response && response.total === 0) {
      setResponseStatus(event, 200)
      return { message: 'No device found' }
    }
    else {
      const tokens = response.data!.map<string>((item: any) => item.token_device)
      const body = {
        tokens,
        notification: {
          body: 'You have a new notification.',
          title: 'Nuxt Template',
        },
      }

      const res = await admin.messaging().sendEachForMulticast(body)

      if (res) {
        setResponseStatus(event, 200)
        return { message: 'Notification sent successfully' }
      }
      else {
        setResponseStatus(event, 400)
        return { message: 'Failed to send notification' }
      }
    }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

import admin from 'firebase-admin'
import { useUserDevice } from '@base/server/composables/useUserDevice'

interface NotificationBody {
  user_id: string
  title: string
  body: string
  link: string
}
export async function pushNotification(param: NotificationBody) {
  if (!param.user_id)
    return

  const service = getFirebaseServiceAccount()

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(service as admin.ServiceAccount),
    })
  }

  const { getUserDeviceAllTokens } = useUserDevice({ user_id: param.user_id })
  const response = await getUserDeviceAllTokens({} as ParsedFilterQuery)

  if (response && response.total === 0)
    return
  const tokens = response.data!.map<string>((item: any) => item.token_device)
  const body = {
    tokens,
    notification: {
      body: param.body || 'You have a new notification.',
      title: param.title || 'Nuxt Template',
    },
    webpush: {
      fcmOptions: {
        link: param.link,
      },
    },
  }

  const res = await admin.messaging().sendEachForMulticast(body)
  console.log('push:', res)
  return res
}

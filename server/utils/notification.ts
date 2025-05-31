import firebaseAdmin from 'firebase-admin'

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

  if (firebaseAdmin.apps.length === 0) {
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(service as firebaseAdmin.ServiceAccount),
    })
  }

  const { getDeviceTokens } = useDeviceToken()

  const response = await getDeviceTokens(param.user_id)

  if (response && response.length === 0)
    return
  const tokens = response!.map<string>((item: any) => item.token_device)
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

  const res = await firebaseAdmin.messaging().sendEachForMulticast(body)

  logger.log('Notification pushed:', res)

  return res
}

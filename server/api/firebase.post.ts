import admin from 'firebase-admin'

export default defineEventHandler(async (event) => {
  const { user_id } = await readBody(event)
  if (!user_id)
    return { message: 'User id is required' }

  const service = serviceAccount()
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(service as admin.ServiceAccount),
    })
  }

  const { data } = await supabaseAdmin.from('user_devices').select().match({ user_id })
  if (data && data.length === 0) {
    setResponseStatus(event, 200)
    return { message: 'No device found' }
  }
  else {
    const tokens = data!.map((item: any) => item.token_device)
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
})

import { useLocalStorage } from '@vueuse/core'
import admin from 'firebase-admin'
import { set } from 'firebase/database'

export default defineEventHandler(async (event) => {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount() as admin.ServiceAccount),
    })
  }

  const token1 = 'fPxIumYZRvvGYgJWJYB--N:APA91bHn64NzYkoSdEIeAAaNrDD0LdDxM3doS2mfBpnQiox_W0qPk9AYSXF16A5E2E9dox-eGMlsEpQ2aeQTQUsO_cyXw8nm9eUGNZmanq1BMtLUgpPjOso3-rcLQlacAdvduz46N3Ui'
  const token2 = 'dN3PkDETUh12jQgnD7WrQs:APA91bHkmFmgeKQMBZgR1yC0_uglB8cACFQvLsEoy07F4ReAmitDDW5HjemXLZlwma6m0wCcqUKiEFPpJa0pw_uU6V0xBUMj8F43qc1xvTBbgDcOYFlq6mldvFQMdlUDKvophgCwFIZq'
  const token3 = 'PxIumYZRvvGYgJWJYB--'
  const body = {
    tokens: [token1, token2, token3],
    notification: {
      body: 'You have a new notification.',
      title: 'Nuxt Template',
    },
  }
  const data = await admin.messaging().sendEachForMulticast(body)
  if (data) {
    console.log('data:', data)
    setResponseStatus(event, 200)
    return { message: 'Notification sent successfully' }
  }
  else {
    setResponseStatus(event, 400)
    return { message: 'Failed to send notification' }
  }
})

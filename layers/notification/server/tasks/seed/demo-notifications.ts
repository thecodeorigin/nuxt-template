import { notificationTable } from '@nuxthub/db/schema'
import { DEMO_NOTIFICATIONS } from '#layers/notification/server/constants/defaults'

interface Payload {
  user_id?: string
  organization_id?: string
}

export default defineTask({
  meta: {
    name: 'seed:demo-notifications',
    description: 'Seed the demo notification fixtures for a (user_id, organization_id) pair so the inbox isn\'t empty. Idempotent — keyed by dedupe_key.',
  },
  run: async ({ payload }: { payload?: Payload } = {}) => {
    if (!payload?.user_id || !payload?.organization_id)
      throw new Error('seed:demo-notifications requires payload.user_id and payload.organization_id')

    const user_id = payload.user_id
    const organization_id = payload.organization_id
    const now = Date.now()
    for (let i = 0; i < DEMO_NOTIFICATIONS.length; i++) {
      const n = DEMO_NOTIFICATIONS[i]!
      await db.insert(notificationTable).values({
        user_id,
        organization_id,
        sender_name: n.senderName,
        body: n.body,
        is_read: i >= 3,
        dedupe_key: `demo-${i}`,
        created_at: new Date(now - i * 3_600_000),
      }).onConflictDoUpdate({
        target: [notificationTable.user_id, notificationTable.organization_id, notificationTable.dedupe_key],
        set: { is_read: i >= 3 },
      })
    }
    return { result: 'ok', user_id, organization_id, total: DEMO_NOTIFICATIONS.length }
  },
})

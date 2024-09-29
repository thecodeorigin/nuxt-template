import type { InferSelectModel } from 'drizzle-orm'
import type { sysUserTable } from '@imrim12/base/schemas'
import { sysNotificationTable } from '@imrim12/base/schemas'
import { db } from '../../../layers/base/server/utils/db'

type Notification = Partial<typeof sysNotificationTable.$inferSelect>

export async function seedNotifications(users: InferSelectModel<typeof sysUserTable>[]) {
  console.log('Seeding notifications...')

  return await db.insert(sysNotificationTable).values(users.reduce((acc: Notification[], user) => {
    const notifications = Array.from({ length: 10 }).map((): Notification => ({
      user_id: user.id,
      title: `Notification ${user.full_name}`,
      message: `Notification send to ${user.email}`,
    }))
    return acc.concat(notifications)
  }, [] as Notification[]))
}

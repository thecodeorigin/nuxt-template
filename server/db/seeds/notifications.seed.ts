import type { InferSelectModel } from 'drizzle-orm'
import type { sysUserTable } from '../schemas'
import { sysNotificationTable } from '../schemas'
import { db } from '../../utils/db'

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

import { notificationTable } from '../schemas'
import { db } from '../../utils/db'

export async function seedNotifications(id: string, email: string) {
  console.log('Seeding notifications...')
  const notifications = Array.from({ length: 10 }).map(() => ({
    user_id: id,
    title: `Notification test ${Math.random()}`,
    message: `Notification send to ${email}`,
  }))
  return await db.insert(notificationTable).values(notifications)
}

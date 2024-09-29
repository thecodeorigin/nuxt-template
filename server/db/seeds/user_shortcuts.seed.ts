import type { InferSelectModel } from 'drizzle-orm'
import type { sysUserTable } from '../schemas'
import { userShortcutTable } from '../schemas'
import { db } from '../../../layers/materialize/server/utils/db'

export async function seedUserShortcuts(users: InferSelectModel<typeof sysUserTable>[]) {
  console.log('Seeding user shortcuts...')

  return await db.insert(userShortcutTable).values([
    ...users.map(user => ({
      route: '/projects',
      user_id: user.id,
    })),
    ...users.map(user => ({
      route: '/dashboard',
      user_id: user.id,
    })),
  ])
}

import type { InferSelectModel } from 'drizzle-orm'
import { randRecentDate } from '@ngneat/falso'
import type { sysUserTable } from '@imrim12/base/schemas'
import { categoryTable } from '../schemas'
import { db } from '../../../layers/base/server/utils/db'

export async function seedCategories(users: InferSelectModel<typeof sysUserTable>[]) {
  console.log('Seeding categories...')

  return await db.insert(categoryTable).values(users.map(user => ({
    name: 'Category for testing',
    slug: `category-for--testing-${randRecentDate({ days: 365 }).getTime()}`,
    user_id: user.id,
  }))).returning()
}

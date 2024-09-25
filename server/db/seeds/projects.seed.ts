import type { InferSelectModel } from 'drizzle-orm'
import type { categoryTable, sysUserTable } from '../schemas'
import { projectTable } from '../schemas'
import { db } from '../../utils/db'

export async function seedProjects(users: InferSelectModel<typeof sysUserTable>[], categories: InferSelectModel<typeof categoryTable>[]) {
  console.log('Seeding projects...')

  return await db.insert(projectTable).values(users.reduce((acc: any[], user) => {
    const projects = Array.from({ length: 5 }).map(() => ({
      name: `Project ${user.full_name}`,
      user_id: user.id,
      category_id: categories.find(category => category.user_id === user.id)?.id,
      description: `Project description just for testing by ${user.full_name}`,
      status: 'succeeded',
      model: 'medium',
    }))
    return acc.concat(projects)
  }, []))
}

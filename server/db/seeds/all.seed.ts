import { seedRoles } from './roles.seed'
import { seedPermissions } from './permissions.seed'
import { seedUsers } from './users.seed'
import { seedUserShortcuts } from './user_shortcuts.seed'
import { seedCategories } from './categories.seed'
import { seedNotifications } from './notifications.seed'
import { seedProjects } from './projects.seed'

export async function seed() {
  try {
    const roles = await seedRoles()

    await seedPermissions(roles)

    const sysUsers = await seedUsers(roles)

    await seedUserShortcuts(sysUsers)

    const categories = await seedCategories(sysUsers)

    await seedNotifications(sysUsers)

    await seedProjects(sysUsers, categories)
  }
  catch (error: any) {
    console.error(error)
  }
}

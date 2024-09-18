import bcrypt from 'bcrypt'
import { rand, randAvatar, randCountryCode, randEmail, randFullName, randLanguage, randPhoneNumber, randRecentDate } from '@ngneat/falso'
import { db } from '../../utils/db'
import { sysUserTable } from '../schemas/sys_users.schema'
import { sysRoleTable } from '../schemas/sys_roles.schema'
import { categoryTable } from '../schemas/category.schema'
import { sysPermissionTable } from '../schemas/sys_permissions.schema'
import { userShortcutTable } from '../schemas/user_shortcuts.schema'
import { sysNotificationTable } from '../schemas/sys_notifications.schema'
import { projectTable } from '../schemas/project.schema'

type Notification = Partial<typeof sysNotificationTable.$inferSelect>
export async function seed() {
  try {
    console.log('Seeding database...')

    console.log('Creating roles and permissions...')

    const roles = await db.insert(sysRoleTable)
      .values([
        { name: 'Admin' },
        { name: 'Editor' },
        { name: 'Reader' },
      ])
      .returning()

    const adminRole = roles.find(role => role.name === 'Admin')
    const editorRole = roles.find(role => role.name === 'Editor')
    const readerRole = roles.find(role => role.name === 'Reader')

    await db.insert(sysPermissionTable).values([
      { role_id: adminRole!.id, action: 'manage' as const, subject: 'all' as const },
      { role_id: editorRole!.id, action: 'manage' as const, subject: 'Post' as const },
      { role_id: readerRole!.id, action: 'read' as const, subject: 'Post' as const },
      { role_id: editorRole!.id, action: 'manage' as const, subject: 'Category' as const },
      { role_id: readerRole!.id, action: 'read' as const, subject: 'Category' as const },
    ].filter(Boolean))

    console.log('Creating users...')

    const sysUsers = await db.insert(sysUserTable).values(
      await Promise.all(Array.from({ length: 50 }).fill(null).map(
        async () => ({
          email: randEmail(),
          phone: randPhoneNumber(),
          full_name: randFullName(),
          password: await bcrypt.hash('123456', 10),
          language: randLanguage(),
          country: randCountryCode(),
          avatar_url: randAvatar(),
          city: '',
          postcode: '',
          address: '',
          organization: '',
          role_id: rand(roles).id,
        }),
      )),
    ).returning()

    console.log('Creating categories...')

    await db.insert(userShortcutTable).values([
      ...sysUsers.map(user => ({
        route: '/projects',
        user_id: user.id,
      })),
      ...sysUsers.map(user => ({
        route: '/dashboard',
        user_id: user.id,
      })),
    ])
    const categories = await db.insert(categoryTable).values(sysUsers.map(user => ({
      name: 'Category for testing',
      slug: `Category for testing',-${randRecentDate({ days: 365 }).getTime()}`,
      user_id: user.id,
    }))).returning()

    await db.insert(sysNotificationTable).values(sysUsers.reduce((acc: Notification[], user) => {
      const notifications = Array.from({ length: 10 }).map((): Notification => ({
        user_id: user.id,
        title: `Notification ${user.full_name}`,
        message: `Notification send to ${user.email}`,
      }))
      return acc.concat(notifications)
    }, [] as Notification[]))

    await db.insert(projectTable).values(sysUsers.reduce((acc: any[], user) => {
      const projects = Array.from({ length: 5 }).map(() => ({
        name: `Project ${user.full_name}`,
        user_id: user.id,
        category_id: categories.find(category => category.user_id === user.id)?.id,
        description: `Project description just for testing by ${user.full_name}`,
      }))
      return acc.concat(projects)
    }, []))
  }
  catch (error: any) {
    console.error(error)
  }
}

import bcrypt from 'bcrypt'
import { rand, randAvatar, randCountryCode, randEmail, randFullName, randLanguage, randPhoneNumber, randRecentDate } from '@ngneat/falso'
import { sysUserTable } from '../schemas/sys_users.schema'
import { db } from '../../utils/db'
import { sysRoleTable } from '../schemas/sys_roles.schema'
import { categoryTable } from '../schemas/category.schema'
import { sysPermissionTable } from '../schemas/sys_permissions.schema'
import { userShortcutTable } from '../schemas/user_shortcuts.schema'

export async function seed() {
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
    await Promise.all(Array.from({ length: 100 }).fill(null).map(
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
  )
    .returning()

  console.log('Creating categories...')

  await db.insert(categoryTable).values(sysUsers.map(user => ({
    name: 'Uncategorized',
    slug: `uncategorized-${randRecentDate({ days: 365 }).getTime()}`,
    user_id: user.id,
  })))

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
}

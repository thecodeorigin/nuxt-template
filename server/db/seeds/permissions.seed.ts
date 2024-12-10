import type { InferSelectModel } from 'drizzle-orm'
import type { sysRoleTable } from '../schemas'
import { db } from '../../utils/db'
import { sysPermissionTable, sysRolePermissionTable } from '../schemas'

export async function seedPermissions(roles: InferSelectModel<typeof sysRoleTable>[]) {
  console.log('Seeding permissions...')

  const adminRole = roles.find(role => role.name === 'Admin')
  const userRole = roles.find(role => role.name === 'User')
  const visitorRole = roles.find(role => role.name === 'Visitor')

  const data = await db.insert(sysPermissionTable).values([
    { action: 'manage' as const, subject: 'all' as const },
    { action: 'manage' as const, subject: 'User' as const },
    { action: 'manage' as const, subject: 'Role' as const },
    { action: 'manage' as const, subject: 'Permission' as const },
    { action: 'manage' as const, subject: 'Project' as const },
    { action: 'manage' as const, subject: 'Category' as const },
    { action: 'read' as const, subject: 'Project' as const },
    { action: 'read' as const, subject: 'Category' as const },
  ].filter(Boolean)).returning()

  await db.insert(sysRolePermissionTable).values([
    { role_id: adminRole!.id, permission_id: data[0].id },
    { role_id: userRole!.id, permission_id: data[1].id },
    { role_id: userRole!.id, permission_id: data[2].id },
    { role_id: visitorRole!.id, permission_id: data[3].id },
    { role_id: visitorRole!.id, permission_id: data[4].id },
  ])

  return data
}

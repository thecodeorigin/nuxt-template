import type { InferSelectModel } from 'drizzle-orm'
import type { sysRoleTable } from '../schemas'
import { sysPermissionTable } from '../schemas'
import { db } from '../../utils/db'

export async function seedPermissions(roles: InferSelectModel<typeof sysRoleTable>[]) {
  console.log('Seeding permissions...')

  const adminRole = roles.find(role => role.name === 'Admin')
  const userRole = roles.find(role => role.name === 'User')
  const visitorRole = roles.find(role => role.name === 'Visitor')

  return await db.insert(sysPermissionTable).values([
    { role_id: adminRole!.id, action: 'manage' as const, subject: 'all' as const },
    { role_id: userRole!.id, action: 'manage' as const, subject: 'Project' as const },
    { role_id: visitorRole!.id, action: 'read' as const, subject: 'Project' as const },
    { role_id: userRole!.id, action: 'manage' as const, subject: 'Category' as const },
    { role_id: visitorRole!.id, action: 'read' as const, subject: 'Category' as const },
  ].filter(Boolean))
}

import type { InferSelectModel } from 'drizzle-orm'
import type { sysRoleTable } from '../schemas'
import { sysPermissionTable } from '../schemas'
import { db } from '../../utils/db'

export async function seedPermissions(roles: InferSelectModel<typeof sysRoleTable>[]) {
  console.log('Seeding permissions...')

  const adminRole = roles.find(role => role.name === 'Admin')
  const editorRole = roles.find(role => role.name === 'Editor')
  const readerRole = roles.find(role => role.name === 'Reader')

  return await db.insert(sysPermissionTable).values([
    { role_id: adminRole!.id, action: 'manage' as const, subject: 'all' as const },
    { role_id: editorRole!.id, action: 'manage' as const, subject: 'Post' as const },
    { role_id: readerRole!.id, action: 'read' as const, subject: 'Post' as const },
    { role_id: editorRole!.id, action: 'manage' as const, subject: 'Category' as const },
    { role_id: readerRole!.id, action: 'read' as const, subject: 'Category' as const },
  ].filter(Boolean))
}

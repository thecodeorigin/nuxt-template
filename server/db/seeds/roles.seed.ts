import { sysRoleTable } from '@imrim12/base/schemas'
import { db } from '../../../layers/base/server/utils/db'

export async function seedRoles() {
  console.log('Seeding roles...')

  return await db.insert(sysRoleTable)
    .values([
      { name: 'Admin' },
      { name: 'Editor' },
      { name: 'Reader' },
    ])
    .returning()
}

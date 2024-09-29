import { sysRoleTable } from '../schemas'
import { db } from '../../../layers/materialize/server/utils/db'

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

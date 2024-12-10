import type { InferSelectModel } from 'drizzle-orm'
import type { sysRoleTable } from '../schemas'
import { randAvatar, randCountryCode, randEmail, randFullName, randLanguage, randPhoneNumber } from '@ngneat/falso'
import bcrypt from 'bcrypt'
import { db } from '../../utils/db'
import { sysRoleUserTable, sysUserTable } from '../schemas'

export async function seedUsers(roles: InferSelectModel<typeof sysRoleTable>[]) {
  console.log('Seeding users...')

  const adminRole = roles.find(role => role.name === 'Admin')

  const testUser = {
    email: 'test@gmail.com',
    password: await bcrypt.hash('123456', 10),
  }

  const users = await Promise.all(Array.from({ length: 15 }).fill(null).map(
    async () => ({
      email: randEmail(),
      password: await bcrypt.hash('123456', 10),
      phone: randPhoneNumber(),
      full_name: randFullName(),
      language: randLanguage(),
      country: randCountryCode(),
      avatar_url: randAvatar(),
      city: '',
      postcode: '',
      address: '',
      organization: '',
    }),
  ))

  users[0].email = testUser.email
  users[0].password = testUser.password

  const data = await db.insert(sysUserTable).values(users).returning()

  await db.insert(sysRoleUserTable).values(data.map(user => ({
    role_id: adminRole!.id,
    user_id: user.id,
  })))

  return data
}

import { rand, randAvatar, randCountryCode, randEmail, randFullName, randLanguage, randPhoneNumber } from '@ngneat/falso'
import type { InferSelectModel } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import type { sysRoleTable } from '../schemas'
import { sysUserTable } from '../schemas'
import { db } from '../../utils/db'

export async function seedUsers(roles: InferSelectModel<typeof sysRoleTable>[]) {
  console.log('Seeding users...')

  const testUser = {
    email: randEmail(),
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
      role_id: rand(roles).id,
    }),
  ))

  users[0].email = testUser.email
  users[0].password = testUser.password

  return await db.insert(sysUserTable).values(users).returning()
}

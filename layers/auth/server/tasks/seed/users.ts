import { SEED_USERS } from '#layers/auth/server/constants/defaults'
import { createUser } from '#layers/auth/server/services/user'

export default defineTask({
  meta: {
    name: 'seed:users',
    description: 'Seed the three dev/demo users (admin, alice, bob) at @seed.local and their personal orgs. Idempotent.',
  },
  run: async () => {
    const seeded: Array<{ id: string, primary_email: string, created: boolean }> = []
    for (const u of SEED_USERS) {
      const result = await createUser({
        email: u.primary_email,
        name: u.name,
        username: u.username,
        primary_phone: u.primary_phone ?? null,
        verified: true,
      })
      seeded.push({ id: result.user.id, primary_email: result.user.primary_email, created: result.created })
    }
    return { result: 'ok', total: seeded.length, users: seeded }
  },
})

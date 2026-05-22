import { seedPermissions } from '#layers/auth/server/services/permissions'
import { seedUsers } from '#layers/auth/server/services/seed'
import { seedDemoOrganization, seedSystemOrganization } from '#layers/auth/server/services/seed-organizations'

export default defineTask({
  meta: { name: 'seed:users', description: 'Seed catalog, users, system org, and Demo org.' },
  run: async () => {
    const permissions = await seedPermissions()
    const users = await seedUsers()
    const systemOrgId = await seedSystemOrganization()
    const demoOrgId = await seedDemoOrganization()
    return { result: 'ok', permissions, users: users.map(u => u.primary_email), systemOrgId, demoOrgId }
  },
})

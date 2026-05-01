import type { SeededUser } from '~~/server/services/seed'
import { z } from 'zod'
import { getPgClient } from '~~/server/utils/pg'
import { SEED_USERS, seedUsers, unseedUsers } from '~~/server/services/seed'

const PayloadSchema = z.object({
  direction: z.enum(['up', 'down']).default('up'),
})

type SeedTaskResult =
  | { direction: 'down', removed: number }
  | { direction: 'up', seeded: SeededUser[] }

export default defineTask<SeedTaskResult>({
  meta: {
    name: 'seed:user',
    description: 'Upsert (or remove) the canonical seed users.',
  },
  async run({ payload }) {
    const { direction } = PayloadSchema.parse(payload)
    const db = getPgClient()

    if (direction === 'down') {
      await unseedUsers(db)
      return { result: { direction, removed: SEED_USERS.length } }
    }

    const seeded = await seedUsers(db)
    return { result: { direction, seeded } }
  },
})

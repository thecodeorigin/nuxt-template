import { getPgClient } from '~~/server/utils/pg'
import { seedUsers } from '#layers/auth/server/services/seed'

export default defineEventHandler(async (_event) => {
  if (!import.meta.dev && process.env.NUXT_DEMO_MODE !== 'true') {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const users = await seedUsers(getPgClient())
  return { users }
})

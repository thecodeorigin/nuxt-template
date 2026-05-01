import { defineAuthenticatedHandler } from '#layers/auth/server/services/auth'

export default defineAuthenticatedHandler((_, session) => {
  return session
})

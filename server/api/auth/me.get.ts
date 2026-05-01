import { defineAuthenticatedHandler } from '~~/server/services/auth'

export default defineAuthenticatedHandler((_, session) => {
  return session
})

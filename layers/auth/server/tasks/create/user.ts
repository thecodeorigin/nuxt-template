import { createUser } from '#layers/auth/server/services/user'

interface Payload {
  email?: string
  name?: string
  username?: string
  primary_phone?: string | null
  verified?: boolean
}

export default defineTask({
  meta: {
    name: 'create:user',
    description: 'Idempotent — create a single user (and their personal org) if no user has the email, otherwise return the existing one.',
  },
  run: async ({ payload }: { payload?: Payload } = {}) => {
    if (!payload?.email)
      throw new Error('create:user requires payload.email')
    const result = await createUser({
      email: payload.email,
      name: payload.name,
      username: payload.username,
      primary_phone: payload.primary_phone,
      verified: payload.verified,
    })
    return {
      result: 'ok',
      created: result.created,
      user: { id: result.user.id, primary_email: result.user.primary_email },
      personal_org_id: result.personal_org_id,
    }
  },
})

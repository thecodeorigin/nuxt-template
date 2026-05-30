import type { CreateUserInput } from '#layers/auth/server/services/user'
import { createUsers } from '#layers/auth/server/services/user'

interface Payload {
  users?: readonly CreateUserInput[]
}

export default defineTask({
  meta: {
    name: 'create:users',
    description: 'Bulk-create users from a list. Each entry is idempotent (existing users are reused, not duplicated).',
  },
  run: async ({ payload }: { payload?: Payload } = {}) => {
    if (!payload?.users?.length)
      throw new Error('create:users requires payload.users (non-empty array)')
    const result = await createUsers(payload.users)
    return { result: 'ok', ...result }
  },
})

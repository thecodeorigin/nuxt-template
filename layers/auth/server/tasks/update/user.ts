import type { userTable as UserTableType } from '@nuxthub/db/schema'
import { updateUser } from '#layers/auth/server/services/user'

type UserPatch = Partial<typeof UserTableType.$inferInsert>

interface Payload {
  email?: string
  patch?: UserPatch
}

export default defineTask({
  meta: {
    name: 'update:user',
    description: 'Patch a user row by email and refresh their live sessions. Idempotent — no-op if patch matches current state. Throws if email not found.',
  },
  run: async ({ payload }: { payload?: Payload } = {}) => {
    if (!payload?.email)
      throw new Error('update:user requires payload.email')
    if (!payload.patch)
      throw new Error('update:user requires payload.patch')
    const result = await updateUser({ email: payload.email, patch: payload.patch })
    return {
      result: 'ok',
      changed: result.changed,
      refreshed_sessions: result.refreshed_sessions,
      user: { id: result.user.id, primary_email: result.user.primary_email },
    }
  },
})

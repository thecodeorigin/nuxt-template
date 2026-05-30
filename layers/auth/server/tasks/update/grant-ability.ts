import type { GrantTarget } from '#layers/auth/server/services/grants'
import { grantAbility } from '#layers/auth/server/services/grants'

interface Payload {
  ability?: string
  target?: GrantTarget
}

export default defineTask({
  meta: {
    name: 'update:grant-ability',
    description: 'Add an ability to a scope of users (target.kind: "role" | "members" | "system-admins"). Idempotent — re-runs are no-ops once the ability is present. Refreshes live sessions of affected users.',
  },
  run: async ({ payload }: { payload?: Payload } = {}) => {
    if (!payload?.ability || !payload?.target?.kind)
      throw new Error('update:grant-ability requires payload.ability and payload.target.kind')
    const result = await grantAbility({ ability: payload.ability, target: payload.target })
    return {
      result: 'ok',
      ability: result.ability,
      target: result.target,
      changed: result.changed,
      affected_users: result.affected_users,
      refreshed_sessions: result.refreshed_sessions,
    }
  },
})

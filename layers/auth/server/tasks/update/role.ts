import { updateOrganizationRole } from '#layers/auth/server/services/role'

interface Payload {
  organization_slug?: string
  role_name?: string
  permissions?: readonly string[]
  description?: string | null
}

export default defineTask({
  meta: {
    name: 'update:role',
    description: 'Patch a role\'s permissions and/or description. Refreshes the live session of every member holding the role so the change applies on the next request. Idempotent — no-op if patch matches current state.',
  },
  run: async ({ payload }: { payload?: Payload } = {}) => {
    if (!payload?.organization_slug || !payload?.role_name)
      throw new Error('update:role requires payload.organization_slug, role_name')
    const result = await updateOrganizationRole({
      organization_slug: payload.organization_slug!,
      role_name: payload.role_name!,
      permissions: payload.permissions,
      description: payload.description,
    })
    return {
      result: 'ok',
      changed: result.changed,
      affected_users: result.affected_users,
      refreshed_sessions: result.refreshed_sessions,
      role: { id: result.role.id, name: result.role.name, permissions: result.role.permissions },
    }
  },
})

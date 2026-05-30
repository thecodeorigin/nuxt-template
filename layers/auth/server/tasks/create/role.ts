import { createOrganizationRole } from '#layers/auth/server/services/role'

interface Payload {
  organization_slug?: string
  name?: string
  description?: string | null
  permissions?: readonly string[]
  is_system?: boolean
}

export default defineTask({
  meta: {
    name: 'create:role',
    description: 'Idempotent — create a role in an organization (lookup by slug). Re-runs return the existing role unchanged; use update:role to modify permissions.',
  },
  run: async ({ payload }: { payload?: Payload } = {}) => {
    if (!payload?.organization_slug || !payload?.name || !payload?.permissions)
      throw new Error('create:role requires payload.organization_slug, name, permissions')
    const result = await createOrganizationRole({
      organization_slug: payload.organization_slug!,
      name: payload.name!,
      description: payload.description,
      permissions: payload.permissions!,
      is_system: payload.is_system,
    })
    return {
      result: 'ok',
      created: result.created,
      role: { id: result.role.id, name: result.role.name, permissions: result.role.permissions },
    }
  },
})

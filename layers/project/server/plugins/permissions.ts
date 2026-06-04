import { definePermissionDomain } from '#layers/auth/server/services/permissions-registry'
import { DefaultRole } from '#layers/auth/shared/permissions'

export default defineNitroPlugin(() => {
  definePermissionDomain({
    subject: 'project',
    orgKind: 'tenant',
    self: true,
    defaultRoleAbilities: {
      [DefaultRole.ADMIN]: ['project:manage'],
      [DefaultRole.MEMBER]: ['project:read', 'project:write', 'project:read:self', 'project:write:self', 'project:delete:self', 'project:manage:self'],
      [DefaultRole.GUEST]: ['project:read', 'project:read:self'],
    },
  })
})

import { definePermissionDomain } from '#layers/auth/server/services/permissions-registry'
import { DefaultRole } from '#layers/auth/shared/permissions'

export default defineNitroPlugin(() => {
  definePermissionDomain({
    subject: 'selfhost',
    orgKind: 'tenant',
    self: true,
    defaultRoleAbilities: {
      [DefaultRole.ADMIN]: ['selfhost:manage'],
      [DefaultRole.MEMBER]: ['selfhost:read', 'selfhost:write'],
    },
  })
})

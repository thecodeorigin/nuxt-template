import { createSystemAdmin } from '#layers/auth/server/services/admin'

interface Payload {
  email?: string
  name?: string
}

export default defineTask({
  meta: {
    name: 'create:admin',
    description: 'Create (or reuse) the production system admin and grant SYSTEM_GRANTS.admin in the system org. Default email: admin@<NUXT_PUBLIC_BASE_DOMAIN host>. Idempotent.',
  },
  run: async ({ payload }: { payload?: Payload } = {}) => {
    const result = await createSystemAdmin({
      email: payload?.email,
      name: payload?.name,
    })
    return {
      result: 'ok',
      created: result.created,
      user: { id: result.user.id, primary_email: result.user.primary_email },
      system_org_id: result.system_org_id,
      granted: result.granted,
    }
  },
})

import { regrantSystemAdmins } from '#layers/auth/server/services/admin'

export default defineTask({
  meta: {
    name: 'update:admin',
    description: 'Re-apply current SYSTEM_GRANTS.admin to every system-org member and refresh their live sessions. Run after editing SYSTEM_GRANTS.admin.',
  },
  run: async () => {
    const result = await regrantSystemAdmins()
    return { result: 'ok', ...result }
  },
})

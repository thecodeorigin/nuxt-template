import type { Actions, Rule } from '@/plugins/casl/ability'

export const useAuthStore = defineStore('auth', () => {
  const { data } = useAuth()

  function normalizeRules(rules: Rule[]) {
    const results: Rule[] = []

    for (const rule of rules) {
      if (rule.action === 'manage') {
        results.push(
          ...new Array<Actions>('create', 'read', 'update', 'delete', 'manage').map(action => ({
            ...rule,
            action,
          })),
        )
      }
      else {
        results.push(rule)
      }
    }

    return results
  }

  const currentUser = computed(() => data.value?.user || null)

  const currentRole = computed(() => currentUser.value?.role || null)

  const currentPermissions = computed(() => normalizeRules(currentRole.value?.permissions || []))

  return {
    currentUser,
    currentRole,
    currentPermissions,
  }
})

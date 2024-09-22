import type { Actions, Rule } from '@/plugins/casl/ability'

export const useAuthStore = defineStore('auth', () => {
  const { status, data, signOut } = useAuth()

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

  const isAuthenticated = computed(() => Boolean(status.value === 'authenticated' && data.value?.user.id))

  const currentUser = computed(() => data.value?.user || null)

  const currentRole = computed(() => currentUser.value?.role || null)

  const currentPermissions = computed(() => normalizeRules(currentRole.value?.permissions || []))

  const pendingUser = ref<{ email: string }>()
  function setPendingUser(email: string) {
    pendingUser.value = { email }
  }

  return {
    isAuthenticated,
    currentUser,
    currentRole,
    currentPermissions,
    pendingUser,
    setPendingUser,
    signOut,
  }
})

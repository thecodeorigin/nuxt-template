import type { InferSelectModel } from 'drizzle-orm'
import type { sysPermissionTable } from '@base/server/db/schemas'
import type { Actions, Rule, Subjects } from '~/stores/casl'

type Permission = InferSelectModel<typeof sysPermissionTable>

export const useAuthStore = defineStore('auth', () => {
  const { status, data, signOut } = useAuth()

  function normalizeRules(permissions: Permission[]) {
    const results: Rule[] = []

    for (const permission of permissions) {
      if (permission.action === 'manage') {
        results.push(
          ...new Array<Actions>('create', 'read', 'update', 'delete', 'manage').map(action => ({
            subject: permission.subject as Subjects,
            action,
          })),
        )
      }
      else {
        results.push({
          action: permission.action as Actions,
          subject: permission.subject as Subjects,
        })
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

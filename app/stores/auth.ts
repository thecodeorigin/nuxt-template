import type { AuthUser, ImpersonatorInfo } from '~~/server/utils/auth'
import { useAuthApi } from '~/api/useAuthApi'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = useState<AuthUser | null>('user', () => null)

  const authApi = useAuthApi()

  const impersonator = computed<ImpersonatorInfo | null>(
    () => currentUser.value?.impersonator ?? null,
  )

  const isImpersonating = computed(() => !!impersonator.value)

  async function fetchCurrentUser() {
    const currentUserData = await authApi.fetchCurrentUser()
    currentUser.value = currentUserData
  }

  async function updateCurrentUser(data: { name: string }) {
    await authApi.updateCurrentUser(data)
    await fetchCurrentUser()
  }

  function fetchUserNotificationSettings() {
    return authApi.fetchUserNotificationSettings()
  }

  async function startImpersonation(userId: string) {
    const session = await authApi.startImpersonation(userId)
    currentUser.value = session
    return session
  }

  async function stopImpersonation() {
    const session = await authApi.stopImpersonation()
    currentUser.value = session
    return session
  }

  async function logout() {
    await authApi.logout()

    currentUser.value = null
  }

  return {
    currentUser,
    impersonator,
    isImpersonating,
    fetchCurrentUser,
    updateCurrentUser,
    fetchUserNotificationSettings,
    startImpersonation,
    stopImpersonation,
    logout,
  }
})

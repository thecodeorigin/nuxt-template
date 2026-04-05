import type { AuthUser } from '~~/server/utils/auth'
import { useAuthApi } from '~/api/useAuthApi'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = useState<AuthUser | null>('user', () => null)

  const authApi = useAuthApi()

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

  async function logout() {
    await authApi.logout()

    currentUser.value = null
  }

  return {
    currentUser,
    fetchCurrentUser,
    updateCurrentUser,
    fetchUserNotificationSettings,
    logout,
  }
})

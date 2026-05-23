import type { AuthUser, ImpersonatorInfo } from '#layers/auth/server/services/auth'
import { useAuthApi } from '#layers/auth/app/api/useAuthApi'
import { useOrganizationApi } from '#layers/auth/app/api/useOrganizationApi'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = useState<AuthUser | null>('user', () => null)

  const authApi = useAuthApi()
  const orgApi = useOrganizationApi()

  const impersonator = computed<ImpersonatorInfo | null>(
    () => currentUser.value?.impersonator ?? null,
  )

  const isImpersonating = computed(() => !!impersonator.value)

  const activeOrganizationId = computed(() => currentUser.value?.activeOrganizationId ?? null)

  async function fetchCurrentUser() {
    const currentUserData = await authApi.fetchCurrentUser()
    currentUser.value = currentUserData
  }

  async function updateCurrentUser(data: { name?: string, username?: string, bio?: string }) {
    await authApi.updateCurrentUser(data)
    await fetchCurrentUser()
  }

  async function updateAvatar(file: File) {
    await authApi.uploadAvatar(file)
    await fetchCurrentUser()
  }

  function fetchUserNotificationSettings() {
    return authApi.fetchUserNotificationSettings()
  }

  function updateUserNotificationSettings(prefs: { email: boolean, product_updates: boolean, weekly_digest: boolean, important_updates: boolean }) {
    return authApi.updateUserNotificationSettings(prefs)
  }

  function updatePhoneNumber(phone: string) {
    return authApi.updatePhoneNumber(phone)
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

  async function switchOrganization(organizationId: string) {
    const session = await orgApi.switchOrganization({ organization_id: organizationId })
    currentUser.value = session
    return session
  }

  async function refreshSession() {
    const session = await orgApi.refreshSession()
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
    activeOrganizationId,
    fetchCurrentUser,
    updateCurrentUser,
    updateAvatar,
    fetchUserNotificationSettings,
    updateUserNotificationSettings,
    updatePhoneNumber,
    switchOrganization,
    refreshSession,
    startImpersonation,
    stopImpersonation,
    logout,
  }
})

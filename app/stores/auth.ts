import type { UserInfoResponse } from '@logto/nuxt'

export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig()

  const client = useLogtoClient()

  const accessToken = useState<string | null>('accessToken', () => null)

  const currentUser = useLogtoUser() as UserInfoResponse | null

  const currentRoles = computed(() => currentUser?.roles || null)

  async function fetchToken() {
    if (client && !accessToken.value && await client.isAuthenticated())
      accessToken.value = await client.getAccessToken(config.public.apiBaseUrl)
  }

  function signIn() {
    return navigateTo({ path: '/auth/signin' }, { external: true })
  }

  function signOut() {
    return navigateTo({ path: '/auth/signout' }, { external: true })
  }

  return {
    accessToken,
    currentUser,
    currentRoles,
    signIn,
    signOut,
    fetchToken,
  }
})

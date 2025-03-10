import type { UserInfoResponse } from '@logto/nuxt'

export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig()

  const client = useLogtoClient()

  const accessToken = useState<string | null>('accessToken', () => null)

  const currentUser = useLogtoUser() as UserInfoResponse & {
    custom_data?: { credit: number }
  } | null

  const currentRoles = computed(() => currentUser?.roles || null)

  async function fetchToken() {
    if (client && !accessToken.value && await client.isAuthenticated())
      accessToken.value = await client.getAccessToken(config.public.apiBaseUrl)
  }

  function signIn() {
    return navigateTo({ path: '/sign-in' }, { external: true })
  }

  function signOut() {
    return navigateTo({ path: '/sign-out' }, { external: true })
  }

  function updateProfile(payload: Partial<{ username: string, name: string, avatar: string }>) {
    return $api('/api/me', {
      method: 'PATCH',
      body: payload,
    })
  }

  return {
    accessToken,
    currentUser,
    currentRoles,
    signIn,
    signOut,
    fetchToken,
    updateProfile,
  }
})

export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig()

  const client = useLogtoClient()

  const accessToken = useState<string | null>('accessToken', () => null)

  const currentUser = useLogtoUser()

  const isAuthenticated = computed(() => Boolean(currentUser))

  const currentRole = computed(() => currentUser.value?.role || null)

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

  return {
    accessToken,
    isAuthenticated,
    currentUser,
    currentRole,
    signIn,
    signOut,
    fetchToken,
  }
})

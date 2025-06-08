import type { User } from '@base/server/types/models'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = useState<User | null>('currentUser', () => null)

  const crsfToken = computed(() => {
    if (import.meta.server)
      return useNuxtApp().ssrContext?.event?.context?.csrfToken

    return window.document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
  })

  const authApi = useApiAuth()

  async function fetchProfile() {
    if (!currentUser.value) {
      const response = await authApi.fetchProfile()

      currentUser.value = response.data
    }

    return currentUser.value
  }

  return {
    crsfToken,
    currentUser,
    fetchProfile,
  }
})

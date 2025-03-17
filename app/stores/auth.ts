export const useAuthStore = defineStore('auth', () => {
  const crsfToken = computed(() => {
    if (import.meta.server)
      return useNuxtApp().ssrContext?.event?.context?.csrfToken

    return window.document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
  })

  function signIn() {
    return navigateTo({ path: '/sign-in' }, { external: true })
  }

  function signOut() {
    return navigateTo({ path: '/sign-out' }, { external: true })
  }

  function updateProfile(payload: Partial<{ username: string, name: string, avatar: string }>) {
    return $api('/api/auth/me', {
      method: 'PATCH',
      body: payload,
    })
  }

  function updatePassword(payload: Partial<{ password: string }>) {
    return $api('/api/auth/password', {
      method: 'POST',
      body: payload,
    })
  }

  return {
    crsfToken,
    signIn,
    signOut,
    updateProfile,
    updatePassword,
  }
})

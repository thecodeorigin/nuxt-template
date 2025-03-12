export const useAuthStore = defineStore('auth', () => {
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
    signIn,
    signOut,
    updateProfile,
  }
})

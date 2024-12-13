export const useAuthStore = defineStore('auth', () => {
  const currentUser = useLogtoUser()

  const isAuthenticated = computed(() => Boolean(currentUser))

  const currentRole = computed(() => currentUser.value?.role || null)

  function signOut() {
    return navigateTo({ path: '/logout' })
  }

  return {
    isAuthenticated,
    currentUser,
    currentRole,
    signOut,
  }
})

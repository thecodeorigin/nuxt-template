export default defineNuxtPlugin({
  async setup() {
    const authStore = useAuthStore()

    if (authStore.isAuthenticated)
      await authStore.fetchToken()
  },
})

export default defineNuxtPlugin({
  name: 'auth',
  async setup() {
    const authStore = useAuthStore()

    if (authStore.currentUser) {
      try {
        await authStore.fetchToken()
      }
      catch {
        notifyError({
          content: 'Failed to retrieve user token.',
        })
      }
    }
  },
})

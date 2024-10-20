export default defineNuxtPlugin({
  parallel: true,
  setup(nuxtApp) {
    nuxtApp.hook('session:cache:refresh', async () => {
      const authStore = useAuthStore()

      if (authStore.isAuthenticated) {
        try {
          await authStore.getCurrentUser()
        }
        catch {}
      }
    })
  },
})

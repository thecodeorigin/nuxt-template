export default defineNuxtPlugin({
  async setup() {
    const authStore = useAuthStore()

    await authStore.fetchToken()
  },
})

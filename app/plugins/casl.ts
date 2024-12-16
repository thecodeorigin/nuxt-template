export default defineNuxtPlugin({
  async setup() {
    const authStore = useAuthStore()
    const caslStore = useCaslStore()

    if (authStore.isAuthenticated)
      await caslStore.fetchScopes()

    return {
      provide: {
        ability: caslStore.ability,
        can: caslStore.ability.can.bind(caslStore.ability),
      },
    }
  },
})

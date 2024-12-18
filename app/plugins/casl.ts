export default defineNuxtPlugin({
  async setup() {
    const authStore = useAuthStore()
    const caslStore = useCaslStore()

    if (authStore.currentUser) {
      try {
        await caslStore.fetchScopes()
      }
      catch {
        notifyError({
          content: 'Failed to fetch user scopes.',
        })
      }
    }

    return {
      provide: {
        ability: caslStore.ability,
        can: caslStore.ability.can.bind(caslStore.ability),
      },
    }
  },
})

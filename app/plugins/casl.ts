export default defineNuxtPlugin({
  async setup() {
    const caslStore = useCaslStore()

    return {
      provide: {
        ability: caslStore.ability,
        can: caslStore.ability.can.bind(caslStore.ability),
      },
    }
  },
})

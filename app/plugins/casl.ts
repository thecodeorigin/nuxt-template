export default defineNuxtPlugin({
  dependsOn: ['auth'],
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

export default defineNuxtPlugin(async () => {
  const caslStore = useCaslStore()

  await caslStore.fetchScopes()

  return {
    provide: {
      ability: caslStore.ability,
      can: caslStore.ability.can.bind(caslStore.ability),
    },
  }
})

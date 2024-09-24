export function useAbility() {
  const caslStore = useCaslStore()

  return caslStore.ability
}

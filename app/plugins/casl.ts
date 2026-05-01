import type { MongoAbility, RawRuleOf } from '@casl/ability'
import { createMongoAbility } from '@casl/ability'
import { abilitiesPlugin } from '@casl/vue'
import { abilitiesToRules } from '~/services/casl'

export default defineNuxtPlugin((nuxtApp) => {
  const ability = createMongoAbility([])
  nuxtApp.vueApp.use(abilitiesPlugin, ability, { useGlobalProperties: true })

  const authStore = useAuthStore()
  watch(
    () => [authStore.currentUser?.abilities ?? [], authStore.currentUser?.id] as const,
    ([abilities, id]) => {
      const rules = abilitiesToRules(abilities as string[], id as string | undefined)
      ability.update(rules as RawRuleOf<MongoAbility>[])
    },
    { immediate: true },
  )

  return {
    provide: { ability },
  }
})

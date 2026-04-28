import type { RawRuleOf } from '@casl/ability'
import { Ability } from '@casl/ability'
import { abilitiesPlugin } from '@casl/vue'
import { abilitiesToRules } from '~/lib/casl'

export default defineNuxtPlugin((nuxtApp) => {
  const ability = new Ability([])
  nuxtApp.vueApp.use(abilitiesPlugin, ability, { useGlobalProperties: true })

  const authStore = useAuthStore()
  watch(
    () => [authStore.currentUser?.abilities ?? [], authStore.currentUser?.id] as const,
    ([abilities, id]) => {
      const rules = abilitiesToRules(abilities as string[], id as string | undefined)
      ability.update(rules as RawRuleOf<Ability>[])
    },
    { immediate: true },
  )

  return {
    provide: { ability },
  }
})

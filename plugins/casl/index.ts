import { cookieRef } from '@/@layouts/stores/config'
import { createMongoAbility } from '@casl/ability'
import { abilitiesPlugin } from '@casl/vue'
import type { Rule } from './ability'

export default defineNuxtPlugin(nuxtApp => {
  const userAbilityRules = cookieRef<Rule[]>('userAbilityRules', [])
  const initialAbility = createMongoAbility(userAbilityRules.value)

  nuxtApp.vueApp.use(abilitiesPlugin, initialAbility, {
    useGlobalProperties: true,
  })
})

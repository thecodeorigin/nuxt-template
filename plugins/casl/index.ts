import { createMongoAbility } from '@casl/ability'
import { abilitiesPlugin } from '@casl/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const { currentPermissions } = useAuthStore()

  const initialAbility = createMongoAbility(currentPermissions)

  nuxtApp.vueApp.use(abilitiesPlugin, initialAbility, {
    useGlobalProperties: true,
  })
})

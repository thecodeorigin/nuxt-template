import { createMongoAbility } from '@casl/ability'
import { abilitiesPlugin } from '@casl/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const { data: sessionData } = useAuth()

  const initialAbility = createMongoAbility(sessionData.value?.user.role.permissions || [])

  nuxtApp.vueApp.use(abilitiesPlugin, initialAbility, {
    useGlobalProperties: true,
  })
})

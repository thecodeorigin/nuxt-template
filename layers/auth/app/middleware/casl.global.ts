import { pageMetaCanCheck } from '#layers/auth/app/composables/casl'

export default defineNuxtRouteMiddleware((to) => {
  const required = (to.meta.can ?? []) as string[]
  if (required.length === 0)
    return

  const authStore = useAuthStore()
  const abilities = authStore.currentUser?.abilities ?? []

  if (!pageMetaCanCheck(abilities, required)) {
    return navigateTo('/forbidden')
  }
})

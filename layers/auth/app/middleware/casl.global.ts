import { pageMetaCanCheck } from '#layers/auth/app/composables/casl'

export default defineNuxtRouteMiddleware((to) => {
  const required = (to.meta.can ?? []) as string[]
  if (required.length === 0)
    return

  const { $ability } = useNuxtApp()

  if (!pageMetaCanCheck($ability, required)) {
    return navigateTo('/forbidden')
  }
})

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.meta.public)
    return

  if (to.meta.auth) {
    const currentUser = useLogtoUser()

    if (!currentUser) {
      return navigateTo({ path: '/sign-in' }, { external: true })
    }
  }
})

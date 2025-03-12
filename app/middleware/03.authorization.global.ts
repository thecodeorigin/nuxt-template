export default defineNuxtRouteMiddleware(async (to) => {
  if (to.meta.public || !to.meta.scopes)
    return

  const config = useRuntimeConfig()

  if (!config.public.features.authorization)
    return

  const caslStore = useCaslStore()

  const currentUser = useLogtoUser()

  if (currentUser) {
    try {
      await caslStore.fetchScopes()
    }
    catch {
      notifyError({
        content: 'Failed to fetch user scopes.',
      })
    }
  }

  const { can } = useAbility()

  if (
    !(
      Array.isArray(to.meta.scopes)
      && to.meta.scopes.some((scope: string) => {
        const [action, subject] = scope.split(':') as [string, string]

        return can(action, subject)
      })
    )
  ) {
    throw createError({
      statusCode: 403,
    })
  }
})

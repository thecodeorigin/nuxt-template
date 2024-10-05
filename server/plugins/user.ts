import { useShortcutCrud } from '@base/server/composables/useShortcutCrud'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('user:created', async (sysUser) => {
    if (sysUser.email)
      await createStripeCustomerOnSignup(sysUser.email)

    const { createShortcut } = useShortcutCrud(sysUser.id)

    await Promise.all([
      createShortcut({
        route: '/projects',
        user_id: sysUser.id,
      }),
      createShortcut({
        route: '/dashboard',
        user_id: sysUser.id,
      }),
    ])
  })
})

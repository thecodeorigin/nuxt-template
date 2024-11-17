import { useShortcutCrud } from '@base/server/composables/useShortcutCrud'
import { eq } from 'drizzle-orm'
import { sysRoleUserTable } from '../db/schemas'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('user:created', async (sysUser) => {
    const userRole = await db.query.sysRoleTable.findFirst({
      where: sysRoleTable => eq(sysRoleTable.name, 'User'),
    })

    if (!userRole) {
      throw createError({
        statusCode: 403,
        statusMessage: ErrorMessage.CANNOT_FIND_ROLE,
      })
    }

    await db.insert(sysRoleUserTable).values({
      role_id: userRole.id,
      user_id: sysUser.id,
    })

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

  nitroApp.hooks.hook('session:cache:clear', ({ providerAccountId }) =>
    clearCache(getStorageSessionKey(providerAccountId)))
})

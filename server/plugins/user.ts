import { useCategoryCrud } from '@/server/composables/useCategoryCrud'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('user:created', async (sysUser) => {
    const { createCategory } = useCategoryCrud({ user_id: sysUser.id })

    await Promise.all([
      createCategory({
        name: 'Uncategorized',
        slug: `uncategorized-${Date.now()}`,
      }),
    ])
  })
})

import { syncDefaultRolePermissions } from '#layers/auth/server/tasks/roles/sync'

export default defineEventHandler(async (event) => {
  const { taskSecret } = useRuntimeConfig()
  if (!taskSecret || getHeader(event, 'Authorization') !== `Bearer ${taskSecret}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return await syncDefaultRolePermissions()
})

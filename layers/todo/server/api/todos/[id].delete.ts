import { kv } from '@nuxthub/kv'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  if (!(await kv.has(`todo:${id}`))) {
    throw createError({ statusCode: 404, statusMessage: 'Todo not found' })
  }

  await kv.del(`todo:${id}`)
  return { success: true }
})

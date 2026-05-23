import { blob } from '@nuxthub/blob'
import { createError, eventHandler, getRouterParam } from 'h3'

const ALLOWED_PREFIX = /^(?:avatars|public)\//

export default eventHandler(async (event) => {
  const pathname = getRouterParam(event, 'pathname') || ''
  if (!ALLOWED_PREFIX.test(pathname) || pathname.includes('..'))
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return blob.serve(event, pathname)
})

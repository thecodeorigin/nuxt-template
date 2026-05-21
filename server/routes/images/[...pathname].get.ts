import { blob } from '@nuxthub/blob'
import { createError, eventHandler, getRouterParam } from 'h3'

export default eventHandler(async (event) => {
  const pathname = getRouterParam(event, 'pathname')
  if (!pathname) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  return blob.serve(event, pathname)
})

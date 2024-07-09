import { getToken } from '#auth'

export default defineEventHandler(async event => {
  await setAuthOnlyRoute(event, 'You must be signed in to get your token.')

  return getToken({ event })
})

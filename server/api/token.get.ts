import { getToken } from '#auth'

export default defineEventHandler(async (event) => {
  await defineEventOptions(event, 'You must be signed in to get your token.')

  return await getToken({ event })
})

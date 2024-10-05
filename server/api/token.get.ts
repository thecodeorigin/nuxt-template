import { getToken } from '#auth'

export default defineEventHandler(async (event) => {
  await defineEventOptions(event, { auth: true })

  return await getToken({ event })
})

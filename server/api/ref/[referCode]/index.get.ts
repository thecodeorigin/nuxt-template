import { withQuery } from 'ufo'

export default defineEventHandler(async (event) => {
  try {
    const { referCode } = await defineEventOptions(event, { auth: true, params: ['referCode'] })
    const { getReferenceByCode } = useReference()

    return getReferenceByCode(referCode)
  }
  catch (error: any) {
    logger.error('[Reference API] Error fetching reference by refCode:', error)

    throw parseError(error)
  }
})

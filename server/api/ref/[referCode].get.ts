import { withQuery } from 'ufo'

export default defineEventHandler(async (event) => {
  try {
    const { referCode } = await defineEventOptions(event, { params: [REFERENCE_CODE_COOKIE_NAME] })

    setCookie(event, REFERENCE_CODE_COOKIE_NAME, referCode, {
      httpOnly: true,
    })

    return sendRedirect(event, withQuery('/pricing', { referCode }), 301)
  }
  catch (error: any) {
    throw createError({
      statusCode: 503,
      statusMessage: error.message,
    })
  }
})

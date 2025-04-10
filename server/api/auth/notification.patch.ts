import { z } from 'zod'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const body = await readValidatedBody(
      event,
      body => z.object({
        email: z.boolean().nullable(),
        desktop: z.boolean().nullable(),
        product_updates: z.boolean().nullable(),
        weekly_digest: z.boolean().nullable(),
        important_updates: z.boolean().nullable(),
      }).partial().parse(body),
    )

    await enableAccountCenter()

    const userData = await getLogtoUserCustomData(session.sub)

    await updateLogtoUserCustomData(session.sub, { ...userData, ...body })

    return { success: true }
  }
  catch (error: any) {
    logger.error('[Notification API] Error updating user notification settings:', error)

    throw parseError(error)
  }
})

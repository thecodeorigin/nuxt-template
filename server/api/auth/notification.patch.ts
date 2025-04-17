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

    const { updateUser } = useUser()

    await updateUser(session.sub, {
      ...(body.email !== undefined && { email_notifications: body.email }),
      ...(body.desktop !== undefined && { desktop_notifications: body.desktop }),
      ...(body.product_updates !== undefined && { product_updates_notifications: body.product_updates }),
      ...(body.weekly_digest !== undefined && { weekly_digest_notifications: body.weekly_digest }),
      ...(body.important_updates !== undefined && { important_updates_notifications: body.important_updates }),
    })

    return { success: true }
  }
  catch (error: any) {
    logger.error('[Notification API] Error updating user notification settings:', error)
    throw parseError(error)
  }
})

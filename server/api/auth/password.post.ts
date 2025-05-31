import { z } from 'zod'
import { cleanDoubleSlashes } from 'ufo'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const client = useLogtoClient()

    const body = await readValidatedBody(
      event,
      body => z.object({
        password: z.string(),
        password_new: z.string(),
      }).parse(body),
    )

    const accessToken = await client.getAccessToken()

    const verification = await $fetch<{ verificationRecordId: string }>(cleanDoubleSlashes(`${process.env.LOGTO_ENDPOINT}/api/verifications/password`), {
      method: 'POST',
      body: { password: body.password },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    await $fetch(cleanDoubleSlashes(`${process.env.LOGTO_ENDPOINT}/api/my-account/password`), {
      method: 'POST',
      body: { password: body.password_new },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'logto-verification-id': verification.verificationRecordId,
      },
    })

    return { success: true }
  }
  catch (error: any) {
    logger.error('[Password API] Error updating user password:', error)

    throw parseError(error)
  }
})

import { z } from 'zod'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const client = useLogtoClient()

    const body = await readValidatedBody(
      event,
      body => z.object({
        email: z.string().nullable(),
        username: z.string().nullable(),
        name: z.string().nullable(),
        avatar: z.string().url().nullable(),
        password: z.string().nullable(),
      }).partial().parse(body),
    )

    await enableAccountCenter()

    const accessToken = await client.getAccessToken()

    await $fetch(`${process.env.LOGTO_ENDPOINT}/api/my-account`, {
      method: 'PATCH',
      body: {
        name: body?.name || null,
        avatar: body?.avatar || null,
        username: body?.username || null,
        password: body?.password || null,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return { success: true }
  }
  catch (error: any) {
    console.log('ádasđá', error, error.data, error.message)

    throw parseError(error)
  }
})

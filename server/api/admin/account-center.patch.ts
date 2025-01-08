export default defineEventHandler(async () => {
  try {
    const user = useLogtoUser()

    if (!user.roles?.find(role => role === 'Admin')) {
      throw createError({
        statusCode: 401,
        statusMessage: ErrorMessage.UNAUTHORIZED,
      })
    }

    const { access_token: accessToken } = await fetchM2MAccessToken()

    await $fetch(`${process.env.LOGTO_ADMIN_ENDPOINT}/api/account-center`, {
      method: 'PATCH',
      body: {
        enabled: true,
        fields: {
          name: 'Edit',
          avatar: 'Edit',
          username: 'Edit',
          password: 'Edit',
        },
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return { success: true }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

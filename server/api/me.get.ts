export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const sysUser = await getUserBySession(session)

    return sysUser
  }
  catch (error: any) {
    throw parseError(error)
  }
})

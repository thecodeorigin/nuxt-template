import { eq } from 'drizzle-orm'
import { sysRoleTable, sysUserTable } from '~~/server/db/schemas'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const sysUser = await db.query.sysUserTable.findFirst({
      where: eq(sysUserTable.email, session.user.email),
    })

    if (!sysUser) {
      throw new Error(ErrorMessage.INVALID_CREDENTIALS)
    }

    // TODO: check for user ADMIN role
    throw new Error(ErrorMessage.DONOT_HAVE_PERMISSION)

    const { webhookUrl } = await readBody(event)
    const url = await payOSAdmin.confirmWebhook(webhookUrl)
    setResponseStatus(event, 200)
    return {
      message: 'Webhook URL confirmed!',
      url,
    }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

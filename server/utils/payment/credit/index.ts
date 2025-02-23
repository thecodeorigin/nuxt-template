import type { UserInfoResponse } from '@logto/nuxt'
import { useCredit } from '@base/server/composables/useCredit'
import { CreditHistoryType } from '@base/server/db/schemas'

export async function addCreditToUser(user: UserInfoResponse, amount: number) {
  const userData = await getLogtoUserCustomData(user.sub)

  const newAmount = (Number.parseInt(userData.credit || '0')) + amount

  const { updateCreditHistory } = useCredit()

  await updateCreditHistory(CreditHistoryType.TOPUP, amount, user.sub)

  await useNitroApp().hooks.callHook('credit:change', { userId: user.sub, amount: newAmount })

  await updateLogtoUserCustomData(user.sub, { ...userData, credit: newAmount })

  return { success: true }
}

export async function subtractCreditFromUser(user: UserInfoResponse, amount: number) {
  const userData = await getLogtoUserCustomData(user.sub)

  const newAmount = (Number.parseInt(userData.credit || '0')) - amount

  if (newAmount < 0) {
    throw createError({
      message: 'Insufficient amount of credits!',
      statusCode: 402,
    })
  }

  const { updateCreditHistory } = useCredit()

  await updateCreditHistory(CreditHistoryType.SPEND, amount, user.sub)

  await useNitroApp().hooks.callHook('credit:change', { userId: user.sub, amount: newAmount })

  await updateLogtoUserCustomData(user.sub, { ...userData, credit: newAmount })

  return { success: true }
}

import { useCredit } from '@base/server/composables/useCredit'
import { CreditHistoryType } from '@base/server/db/schemas'

export async function addCreditToUser(userId: string, amount: number) {
  const userData = await getLogtoUserCustomData(userId)

  const newAmount = (Number.parseInt(userData.credit || '0')) + amount

  const { updateCreditHistory } = useCredit()

  await updateCreditHistory(CreditHistoryType.TOPUP, amount, userId)

  await useNitroApp().hooks.callHook('credit:change', { userId, amount: newAmount })

  await updateLogtoUserCustomData(userId, { ...userData, credit: newAmount })

  return { success: true }
}

export async function subtractCreditFromUser(userId: string, amount: number) {
  const userData = await getLogtoUserCustomData(userId)

  const newAmount = (Number.parseInt(userData.credit || '0')) - amount

  const { updateCreditHistory } = useCredit()

  await updateCreditHistory(CreditHistoryType.SPEND, amount, userId)

  await useNitroApp().hooks.callHook('credit:change', { userId, amount: newAmount })

  await updateLogtoUserCustomData(userId, { ...userData, credit: newAmount })

  return { success: true }
}

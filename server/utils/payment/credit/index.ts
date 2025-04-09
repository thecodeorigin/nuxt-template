import { useCredit } from '@base/server/composables/useCredit'
import { CreditHistoryType } from '@base/server/db/schemas'

export async function addCreditToUser(userId: string, amount: number) {
  const userData = await getLogtoUserCustomData(userId)

  const newAmount = (Number.parseInt(userData.credit || '0')) + amount

  const { updateCreditHistory, updateUserCredit } = useCredit()

  await updateCreditHistory(CreditHistoryType.TOPUP, amount, userId)

  await updateUserCredit(userId, newAmount)

  // TODO: remove this later
  await updateLogtoUserCustomData(userId, { ...userData, credit: newAmount })

  await useNitroApp().hooks.callHook('credit:change', { userId, amount: newAmount })

  return { success: true }
}

export async function subtractCreditFromUser(userId: string, amount: number) {
  const userData = await getLogtoUserCustomData(userId)

  const newAmount = (Number.parseInt(userData.credit || '0')) - amount

  const { updateCreditHistory, updateUserCredit } = useCredit()

  await updateCreditHistory(CreditHistoryType.SPEND, amount, userId)

  await updateUserCredit(userId, newAmount)

  // TODO: remove this later
  await updateLogtoUserCustomData(userId, { ...userData, credit: newAmount })

  await useNitroApp().hooks.callHook('credit:change', { userId, amount: newAmount })

  return { success: true }
}

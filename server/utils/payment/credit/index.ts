import { CreditHistoryType } from '@base/server/db/schemas'

export async function addCreditToUser(userId: string, amount: number) {
  const { getUserCreditById } = useUserProfile()

  const userCredit = await getUserCreditById(userId)

  const newAmount = userCredit + amount

  const { updateCreditHistory, updateUserCredit } = useCredit()

  await updateCreditHistory(CreditHistoryType.TOPUP, amount, userId)

  await updateUserCredit(userId, newAmount)

  await useNitroApp().hooks.callHook('credit:change', { userId, amount: newAmount })

  return { success: true }
}

export async function subtractCreditFromUser(userId: string, amount: number) {
  const { getUserCreditById } = useUserProfile()

  const userCredit = await getUserCreditById(userId)

  const newAmount = userCredit - amount

  const { updateCreditHistory, updateUserCredit } = useCredit()

  await updateCreditHistory(CreditHistoryType.SPEND, amount, userId)

  await updateUserCredit(userId, newAmount)

  await useNitroApp().hooks.callHook('credit:change', { userId, amount: newAmount })

  return { success: true }
}

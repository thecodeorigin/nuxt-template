import { CreditHistoryType } from '@base/server/db/schemas'
import { resolveUserId } from '../../user-mapping'

export async function addCreditToUser(userId: string, amount: number) {
  // Resolve ID (could be Logto ID or our UUID)
  const resolvedUserId = await resolveUserId(userId)
  if (!resolvedUserId) {
    throw new Error(`User with ID ${userId} not found`)
  }

  const { getUserCreditById } = useUser()

  const userCredit = await getUserCreditById(resolvedUserId)

  const newAmount = userCredit + amount

  const { updateCreditHistory, updateUserCredit } = useCredit()

  await updateCreditHistory(CreditHistoryType.TOPUP, amount, resolvedUserId)

  await updateUserCredit(resolvedUserId, newAmount)

  await useNitroApp().hooks.callHook('credit:change', { userId: resolvedUserId, amount: newAmount })

  return { success: true }
}

export async function subtractCreditFromUser(userId: string, amount: number) {
  // Resolve ID (could be Logto ID or our UUID)
  const resolvedUserId = await resolveUserId(userId)
  if (!resolvedUserId) {
    throw new Error(`User with ID ${userId} not found`)
  }

  const { getUserCreditById } = useUser()

  const userCredit = await getUserCreditById(resolvedUserId)

  const newAmount = userCredit - amount

  const { updateCreditHistory, updateUserCredit } = useCredit()

  await updateCreditHistory(CreditHistoryType.SPEND, amount, resolvedUserId)

  await updateUserCredit(resolvedUserId, newAmount)

  await useNitroApp().hooks.callHook('credit:change', { userId: resolvedUserId, amount: newAmount })

  return { success: true }
}

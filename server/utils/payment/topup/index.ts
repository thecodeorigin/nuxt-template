import type { UserInfoResponse } from '@logto/nuxt'

export async function addCreditToUser(user: UserInfoResponse, amount: number) {
  await useNitroApp().hooks.callHook('credit:change', {
    userId: user.sub,
    amount: amount + (Number.parseInt((user.custom_data as { credit?: string }).credit || '0')),
  })
}

export async function subtractCreditFromUser(user: UserInfoResponse, amount: number) {
  const newAmount = (Number.parseInt((user.custom_data as { credit?: string }).credit || '0')) - amount

  if (newAmount < 0) {
    throw new Error('Not enough credit')
  }

  await useNitroApp().hooks.callHook('credit:change', {
    userId: user.sub,
    amount: amount + (Number.parseInt((user.custom_data as { credit?: string }).credit || '0')),
  })
}

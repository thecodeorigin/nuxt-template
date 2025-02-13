import { updateLogtoUserCustomData } from '../utils/logto'

export default defineNitroPlugin((nitroApp) => {
  // Using 1 hook to update credit
  nitroApp.hooks.hook('credit:change', async (data: {
    userId: string
    amount: number
  }) => {
    try {
      // TODO: what if this failed?
      await updateLogtoUserCustomData(data.userId, {
        credit: data.amount,
      })
    }
    catch (error) {
      console.error(error)
    }
  })
})

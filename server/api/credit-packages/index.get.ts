import { useCreditPackage } from '@base/server/composables/useCreditPackage'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event)

    const { getCreditPackages } = useCreditPackage()

    const prices = await getCreditPackages()

    return { data: prices }
  }
  catch (error) {
    throw parseError(error)
  }
})

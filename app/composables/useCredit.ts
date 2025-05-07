import { creditBusKey } from '@base/injections/credit'

export function useCredit() {
  const credit = ref(0)

  const creditApi = useApiCredit()

  const isRefreshingCredit = ref(false)

  const creditBus = useEventBus(creditBusKey)

  creditBus.on(async () => {
    try {
      isRefreshingCredit.value = true

      const response = await creditApi.fetchCredit()

      // Updated to work with our database-first approach
      // The credit is directly on the user object now
      credit.value = response.data?.credit || 0
    }
    catch {}
    finally {
      isRefreshingCredit.value = false
    }
  })

  function refreshCredit() {
    creditBus.emit()
  }

  return {
    credit,
    isRefreshingCredit,
    refreshCredit,
  }
}

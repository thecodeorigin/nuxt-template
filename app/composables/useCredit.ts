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

      credit.value = response.data?.custom_data?.credit || 0
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

import type { ParsedFilterQuery } from '@base/server/utils/filter'

export function useApiReference() {
  function fetchAvailableReferences() {
    return $api(`/api/ref/available`, {
      method: 'GET',
    })
  }

  function fetchUsageHistoryReferences(query?: Partial<ParsedFilterQuery>) {
    return $api(`/api/ref/history`, {
      method: 'GET',
      query,
    })
  }

  function fetchReferenceByCode(referCode: string) {
    return $api(`/api/ref/${referCode}`, {
      method: 'GET'
    })
  }

  return {
    fetchAvailableReferences,
    fetchUsageHistoryReferences,
    fetchReferenceByCode
  }
}

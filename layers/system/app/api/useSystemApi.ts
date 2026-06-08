import type { DispatchFilter, DispatchResult, DispatchSend } from '#layers/system/shared/schemas/dispatch'

export function useSystemApi() {
  function fetchDispatchOptions() {
    return $http('/api/system/dispatch/options')
  }
  function previewDispatch(filter: DispatchFilter) {
    return $http('/api/system/dispatch/preview', { method: 'POST', body: filter })
  }
  function sendDispatch(payload: DispatchSend): Promise<DispatchResult> {
    return $http<DispatchResult>('/api/system/dispatch/send', { method: 'POST', body: payload })
  }
  return { fetchDispatchOptions, previewDispatch, sendDispatch }
}

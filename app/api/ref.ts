export function useApiReference() {
  function fetchAvailableReferences() {
    return $api(`/api/ref/available`, {
      method: 'GET',
  })
  }

  return {
    fetchAvailableReferences
  }
}

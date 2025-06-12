export function useApiReference() {
  function fetchUnusedReferences() {
    return $api(`/api/ref/unused`, {
      method: 'GET',
  })
  }

  return {
    fetchUnusedReferences
  }
}

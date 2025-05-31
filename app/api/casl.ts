export function useApiCasl() {
  function fetchScopes() {
    return $api('/api/scopes')
  }

  return {
    fetchScopes,
  }
}

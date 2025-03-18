export function useApiHealth() {
  function fetchHealthCheck() {
    return $api<{ success: true }>('/api/health')
  }

  return {
    fetchHealthCheck,
  }
}
